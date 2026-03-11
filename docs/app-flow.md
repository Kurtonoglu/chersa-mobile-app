\# Mobile Barber Booking App Flow



\## Overview



This document describes the intended application flow, user experience, navigation, and booking logic for a mobile barber booking application.



The application is intended for a single barber who works independently. Customers should be able to download the app from the App Store or Google Play, create an account, log in, view information about the barber shop, book appointments, view their own appointments, receive notifications, and manage basic settings.



The purpose of the application is to simplify appointment booking for both the barber and the customers by allowing customers to independently view available time slots and reserve appointments.



\---



\## Main Goal



The main goal of the application is to allow customers to:



\- register and log in using their phone number

\- verify their identity through SMS verification

\- browse the barber shop information

\- reserve appointments

\- see their own appointments

\- cancel appointments

\- receive reminders and barber announcements

\- manage profile and app settings



\---



\## Supported Platforms



The application should be available on:



\- iOS

\- Android



The app should be downloadable from:



\- App Store

\- Google Play



\---



\## User Roles



\### Customer / User



The primary user of the mobile application is the customer.



The customer can:



\- register

\- log in

\- verify phone number

\- access the main dashboard

\- reserve appointments

\- view personal appointments

\- cancel appointments

\- receive notifications

\- manage settings

\- log out



\### Barber



The barber is not the main mobile app user in this flow. The barber is the service provider whose services, announcements, schedule, and availability are presented to customers through the application.



\---



\## Application Entry Flow



When the app is opened for the first time, the user should be presented with an authentication entry screen.



This screen should contain two options:



\- Log In

\- Register



If the user already has an account, they can log in.



If the user does not have an account, they must register before they can access the application.



\---



\## Registration Flow



To create an account, the user must provide:



\- full name

\- phone number

\- password

\- password confirmation



\### Registration validation rules



The application should validate:



\- full name is required

\- phone number is required

\- password is required

\- confirm password is required

\- password and confirm password must match



\### SMS verification



After the registration form is submitted successfully:



1\. the app sends the entered phone number to the backend

2\. the backend requests SMS verification

3\. a verification code is sent to the user's phone number

4\. the user is taken to a verification screen

5\. the user enters the received verification code



\### Verification results



If the verification code is correct:



\- the phone number is verified

\- the account is created successfully

\- the user is authenticated

\- the user is redirected into the app



If the verification code is incorrect or expired:



\- account creation is not completed

\- the user should see an error message

\- the user should be allowed to retry verification



If the phone number is invalid or unreachable:



\- verification should fail

\- the user should be allowed to go back and correct the phone number



\---



\## Login Flow



The user logs in using:



\- phone number

\- password



\### Login validation rules



\- both fields are required

\- the phone number must exist in the system

\- the password must match the stored credentials



\### Login results



If the credentials are correct:



\- login is successful

\- the user enters the main application



If the credentials are incorrect:



\- login is denied

\- an error message should be shown



\---



\## Post-Authentication Flow



After a successful registration or login, the user is taken to the main application area.



The user should remain authenticated until they explicitly log out or their session expires.



\---



\## Main Navigation



The main app should use a bottom tab navigation bar with four sections:



\- Home

\- Appointments

\- Notifications

\- Settings



These tabs should be available after successful authentication.



\---



\## Home Screen



The Home screen is the main landing page after login or registration.



It should contain:



\- barber shop logo

\- short description / about section

\- barber contact phone number

\- link to Google Maps location

\- link to Instagram profile

\- primary action button: \*\*Reserve Appointment\*\*



\### Home screen purpose



The Home screen should:



\- introduce the barber shop

\- provide useful business/contact information

\- serve as the starting point for the booking process



\---



\## Booking Flow



The Home screen contains a \*\*Reserve Appointment\*\* button.



When the user taps this button, the booking flow begins.



\### Step 1: Select Date



The user should see a calendar interface.



The user selects a day for the appointment.



\### Date selection rules



\- only valid selectable days should be shown

\- past dates cannot be selected

\- unavailable dates may be disabled if needed



\---



\### Step 2: Select Service



After selecting a date, the user proceeds to service selection.



Services are divided into three categories:



\- Hair

\- Beard

\- Packages



Each service item should show:



\- service name

\- service price

\- service duration



\### Service selection business rules



The user can choose:



\- one Hair service

\- and optionally one Beard service



OR



\- one Package service



\### Important logic



If the user selects a Package:



\- Hair services become unavailable

\- Beard services become unavailable



If the user selects Hair and/or Beard:



\- Package services become unavailable



This means:



\- user can book Hair only

\- user can book Beard only, if business rules allow it

\- user can book Hair + Beard

\- user can book one Package

\- user cannot combine Package with Hair or Beard



\### Recommended implementation rule



The service selection system must enforce mutual exclusivity between:



\- Package

\- Hair/Beard combination



\---



\### Step 3: Select Time Slot



After the user selects the desired service(s), the app should show available appointment time slots.



The available slots should depend on:



\- selected date

\- selected service duration

\- already booked appointments

\- barber working availability



The user selects a preferred start time.



\---



\### Step 4: Booking Confirmation



After the user selects a time slot, the app should show a booking confirmation summary card.



The summary card should contain:



\- selected date

\- selected start time

\- selected service(s)

\- service category summary

\- total duration

\- total price



Examples of summary output:



\- Hair

\- Beard

\- Hair + Beard

\- Package



The screen should contain two actions:



\- Confirm Booking

\- Go Back



\### Confirmation result



If the user confirms:



\- the booking is saved

\- the selected slot becomes reserved

\- the user is redirected to the Appointments screen



If the user goes back:



\- they can modify previous selections



\---



\## Appointments Screen



The Appointments screen displays only the appointments that belong to the currently authenticated user.



Each appointment should appear as an information card.



Each appointment card should display:



\- service name or summary

\- appointment date

\- start time

\- price



Optional additional fields:



\- duration

\- booking status



\### Appointment cancellation



The user should be able to cancel an appointment from this screen.



There should be a visible cancel action on each appointment card, or at least on cancellable appointments.



\### Cancellation result



If the appointment is cancelled:



\- the appointment should be removed or marked as cancelled

\- the now-free slot becomes available again for future bookings

\- the user should receive feedback that cancellation succeeded



\---



\## Notifications Screen



The Notifications screen should contain notifications relevant to the customer.



Examples include:



\- appointment reminder 1 hour before appointment

\- barber announcements

\- booking confirmation notifications

\- cancellation confirmation notifications



\### Reminder behavior



By default, the system should send a reminder notification approximately 1 hour before the appointment.



\---



\## Settings Screen



The Settings screen should contain standard user settings and app information.



It should include:



\- full name

\- registered phone number

\- language selection

\- about application section

\- logout button



\### Supported languages



The application should support:



\- Bosnian

\- English



\### Logout behavior



When the user taps logout:



\- the current authenticated session ends

\- the user is returned to the authentication entry screen

\- the user cannot access protected screens until logging in again



After logout, the user should not be able to navigate back into authenticated pages without a new login.



\---



\## Session and Access Rules



The following screens require authentication:



\- Home

\- Appointments

\- Notifications

\- Settings

\- Booking flow



If the user is not authenticated, they should only be able to access:



\- entry screen

\- login screen

\- register screen

\- verification screen if applicable



\---



\## Data Visibility Rules



The customer should only see their own data.



This includes:



\- their own appointments

\- their own profile information

\- their own notifications where relevant



The user must not be able to see other customers' appointments or personal data.



\---



\## Suggested Core Entities



The application will likely require at least the following data models:



\### User

\- id

\- fullName

\- phoneNumber

\- passwordHash

\- isPhoneVerified

\- preferredLanguage

\- createdAt

\- updatedAt



\### Service

\- id

\- name

\- category

\- price

\- duration

\- isActive



\### Appointment

\- id

\- userId

\- appointmentDate

\- startTime

\- endTime

\- totalPrice

\- totalDuration

\- status

\- createdAt

\- updatedAt



\### AppointmentService

\- id

\- appointmentId

\- serviceId



\### Notification

\- id

\- userId

\- title

\- message

\- type

\- createdAt

\- isRead



\---



\## Suggested Booking Logic Summary



The booking system should follow these rules:



1\. user must be authenticated

2\. user starts booking from Home screen

3\. user selects a date

4\. user selects service(s)

5\. service selection must follow category rules

6\. app calculates total duration and total price

7\. app shows available time slots based on duration and availability

8\. user selects a time slot

9\. app shows confirmation summary

10\. user confirms booking

11\. appointment is created and shown in Appointments



\---



\## Suggested Notification Logic Summary



The notification system should support at least:



\- booking confirmation

\- appointment reminder

\- barber announcements

\- cancellation feedback



\---



\## Suggested Screen List



The mobile application should contain at least the following screens:



\- Splash / App Load Screen

\- Entry Screen (Log In / Register)

\- Register Screen

\- SMS Verification Screen

\- Login Screen

\- Home Screen

\- Booking - Select Date

\- Booking - Select Service

\- Booking - Select Time

\- Booking - Confirmation

\- Appointments Screen

\- Notifications Screen

\- Settings Screen



\---



\## UI/UX Notes



The app should feel simple and easy to use.



Important UX principles:



\- clear navigation

\- simple booking steps

\- readable appointment cards

\- obvious call-to-action buttons

\- clear validation and error messages

\- no access to protected pages without authentication



\---



\## Implementation Priority



Recommended implementation order:



1\. authentication flow

2\. bottom tab navigation

3\. Home screen

4\. booking flow

5\. Appointments screen

6\. Notifications screen

7\. Settings screen

8\. language switching

9\. reminder notifications



\---



\## Instruction for AI Coding Assistant



Use this document as the main functional specification for the app.



When implementing:



\- follow the described user flow exactly

\- enforce service selection rules strictly

\- protect authenticated routes/screens

\- ensure users only see their own appointments and information

\- implement the booking flow step by step

\- treat this file as the source of truth for app behavior

