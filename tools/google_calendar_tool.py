from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Type, Any, Union, Annotated
from uuid import uuid4
import os
import json
import datetime

SCOPES = ["https://www.googleapis.com/auth/calendar"]

class MeetingInput(BaseModel):
    """Inputs for creating a Google Meet meeting."""
    date: str = Field(..., description="Date of the meeting in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM format (24-hour)")
    end_time: str = Field(..., description="End time in HH:MM format (24-hour)")
    attendees: str = Field(..., description="Comma-separated list of attendee emails")
    topic: str = Field(..., description="Topic or title of the meeting")

class CalendarViewInput(BaseModel):
    """Inputs for viewing calendar events."""
    days: int = Field(default=7, description="Number of days to look ahead for events")

class GoogleCalendarToolBase(BaseTool):
    """Base class for Google Calendar tools with proper type annotations."""
    name: str
    description: str
    return_direct: bool = True

class GoogleCalendarTool(GoogleCalendarToolBase):
    """Tool for creating Google Calendar events with Google Meet integration."""
    name: str = "google_calendar_create_meeting"
    description: str = "Create a Google Calendar event with Google Meet integration. Useful for scheduling meetings with team members."
    args_schema: Type[BaseModel] = MeetingInput

    def _run(self, date: str, start_time: str, end_time: str, attendees: str, topic: str) -> str:
        """Create a Google Meet event and return the meeting details."""
        try:
            # Parse attendees
            attendee_list = [email.strip() for email in attendees.split(",")]
            guests = {email: email for email in attendee_list}
            
            # Format time
            time = {
                'start': f"{date}T{start_time}:00.000000",
                'end': f"{date}T{end_time}:00.000000"
            }
            
            # Create meeting
            meet = CreateMeet(guests, time, topic)
            
            # Extract relevant details
            keys = ['organizer', 'hangoutLink', 'summary', 'start', 'end', 'attendees']
            details = {key: meet.event_states[key] for key in keys}
            
            # Format response for Slack
            response = "✅ Meeting scheduled successfully!\n\n"
            response += f"📋 *Topic:* {details['summary']}\n"
            response += f"🔗 *Meet Link:* {details['hangoutLink']}\n"
            response += f"🕒 *Start:* {details['start']['dateTime']}\n"
            response += f"🕓 *End:* {details['end']['dateTime']}\n"
            response += f"👤 *Organizer:* {details['organizer']['email']}\n"
            response += f"👥 *Attendees:* {', '.join([a['email'] for a in details['attendees']])}\n"
            
            return response
        except Exception as e:
            return f"❌ Error creating meeting: {str(e)}"

    async def _arun(self, date: str, start_time: str, end_time: str, attendees: str, topic: str) -> str:
        """Async implementation of the tool."""
        return self._run(date, start_time, end_time, attendees, topic)


class CreateMeet:
    def __init__(self, attendees: Dict[str, str], event_time: Dict[str, str], Topic):
        authe = auth_calendar()
        attendees_list = [{"email": e} for e in attendees.values()]
        self.event_states = self._create_event(
            attendees_list, event_time, authe, Topic)

    @staticmethod
    def _create_event(
            attendees: List[Dict[str, str]], event_time, authe: build, TopiC):
        event = {"conferenceData": {"createRequest": {"requestId": f"{uuid4().hex}", "conferenceSolutionKey": {"type": "hangoutsMeet"}}},
                 "attendees": attendees,
                 "start": {"dateTime": event_time["start"], 'timeZone': 'Asia/Kolkata'},
                 "end": {"dateTime": event_time["end"], 'timeZone': 'Asia/Kolkata'},
                 "summary": TopiC,
                 "reminders": {"useDefault": True}
                 }
        event = authe.events().insert(calendarId="primary", sendNotifications=True,
                                      body=event, conferenceDataVersion=1).execute()
        return event


class GoogleCalendarViewTool(GoogleCalendarToolBase):
    """Tool for viewing upcoming Google Calendar events."""
    name: str = "google_calendar_view_events"
    description: str = "View upcoming events on your Google Calendar. Useful for checking your schedule."
    args_schema: Type[BaseModel] = CalendarViewInput
    
    def _run(self, days: int = 7) -> str:
        """View upcoming calendar events for the specified number of days."""
        try:
            service = auth_calendar()
            
            # Calculate time range
            now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
            end_date = (datetime.datetime.utcnow() + datetime.timedelta(days=days)).isoformat() + 'Z'
            
            # Call the Calendar API
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now,
                timeMax=end_date,
                maxResults=10,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])

            if not events:
                return "No upcoming events found."
                
            # Format response
            response = f"📅 *Upcoming events for the next {days} days:*\n\n"
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                start_dt = datetime.datetime.fromisoformat(start.replace('Z', '+00:00'))
                formatted_start = start_dt.strftime('%Y-%m-%d %H:%M')
                
                response += f"• *{event['summary']}*\n"
                response += f"  📆 {formatted_start}\n"
                
                if 'hangoutLink' in event:
                    response += f"  🔗 {event['hangoutLink']}\n"
                    
                response += "\n"
                
            return response
        except Exception as e:
            return f"❌ Error retrieving calendar events: {str(e)}"
    
    async def _arun(self, days: int = 7) -> str:
        """Async implementation of the tool."""
        return self._run(days=days)


def auth_calendar():
    """Authenticate with Google Calendar API"""
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
            # Save the credentials for the next run
            with open("token.json", "w") as token:
                token.write(creds.to_json())

    service = build("calendar", "v3", credentials=creds)
    return service
