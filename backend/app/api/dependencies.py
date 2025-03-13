import os
import hmac
import hashlib
import time
from fastapi import Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from dotenv import load_dotenv

load_dotenv()

async def verify_slack_signature(
    request: Request,
    x_slack_signature: str = Header(...),
    x_slack_request_timestamp: str = Header(...)
):
    """Verify that the request is coming from Slack"""
    # Get request body (need to read and restore it for the route handler)
    body = await request.body()
    body_str = body.decode("utf-8")
    
    # Restore the request body for the route handler
    async def receive():
        return {"type": "http.request", "body": body}
    request._receive = receive
    
    # Check timestamp to prevent replay attacks
    if abs(time.time() - int(x_slack_request_timestamp)) > 60 * 5:
        raise HTTPException(status_code=403, detail="Request timestamp too old")
    
    # Create signature
    signing_secret = os.getenv("SLACK_SIGNING_SECRET")
    if not signing_secret:
        raise HTTPException(status_code=500, detail="Slack signing secret not configured")
    
    sig_basestring = f"v0:{x_slack_request_timestamp}:{body_str}"
    my_signature = f"v0={hmac.new(signing_secret.encode(), sig_basestring.encode(), hashlib.sha256).hexdigest()}"
    
    # Compare signatures
    if not hmac.compare_digest(my_signature, x_slack_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    return True
