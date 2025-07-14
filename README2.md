#Main functions walkthrough

**Student name:**  Xiaofeng Lin

## Core: Development workflow (3 marks)

- **One line description:** Describe the mobil app development encironment and what tools are using.
- **Video timestamp:** 00:00 - 01:03 / 05:50-05:58
- **Relevant files**
   - yoga-app\app
   - yoga-app\_context
   - yoga-app\components
   - yoga-app\app.json
   - yoga-app\package.json

## Core: Core functionality (3 marks)

- **One line description:** decsribe the app for major functions including, users authentication, courses display, booking courses function and search courses
- **Video timestamp:** 00:45-01:10 / 02:58-03:15
- **Relevant files**
   - yoga-app\_context\AuthContext.js 
   - yoga-app\app\profile
         this is to manage user profile including login/register/logout authentication
   - yoga-app\app\booking
         this is to manage the user booking courses
   - yoga-app\app\course
         this provides courses resources in server and also manage course as an admin.

## Core: User interface design (3 marks)

- **One line description:** 01:10-03:25 / 06:00-06:16
- **Video timestamp:** dispaly the main screens style and components applied for interface design
- **Relevant files**
   - yoga-app\components\courseCard.jsx
         design the reused course card for all courses.
   - yoga-app\components\bookingItem.jsx
         design the interface of bookings
   - yoga-app\components\courseForm.jsx
         design the form to create a new course for admin
   - yoga-app\components\homeLocationRecommendations.jsx
         design to use location service to display the neaarby courses reccomendation in home screen.

## Core: API integration (3 marks)

- **One line description:** 
- **Video timestamp:** 04:30-05:51
- **Relevant files**
   - yoga-app\.env
            this is the entry point of the base url which is hosting the server database to listen and response the request from this app
   - yoga-app\app
      - \booking\bookingScreen.jsx
            link the booking logic flow from back server.
      - \course\index.jsx
            link the course logic flow from back server.
   - yoga-app\_context\AuthContext.js
            link to server about the authentication flow, including fetch the tokens and store them to manage the current user.

## Additional: Device notifications (3 marks)

- **One line description:** Push the location notification when user successfully booked a course, notify the booking is confirmed with booking details.
- **Video timestamp:** 02:38-02:58
- **Relevant files**
   - yoga-app\_context\NotificationContext.js
            this initiate the notification function in react native and expo.
   - yoga-app\components\courseCard.jsx
            in Coursecard, the book button will trigger the notification.

## Additional: Linking (3 marks)

- **One line description:** defined the scheme yogaapp to use the deep linking to share the course screen which is public 
- **Video timestamp:** 03:20-03:54
- **Relevant files**
   - yoga-app\app.json
            define the scheme of yogaapp
   - yoga-app\app\course\index.jsx
            create url to share course screen using linking from expo.

## Additional: Share (3 marks)

- **One line description:** 03:53-04:26
- **Video timestamp:** create the url for each specific course with its id and enable it to be shareable
- **Relevant files**
   - yoga-app\app.json
            define the scheme of yogaapp
   - yoga-app\components\courseCard.jsx
            using Share.share() from react native in coursecard to be applied to each courses.
   
## Additional: Location services (3 marks)

- **One line description:** use location service to display the neaarby courses reccomendation in home screen.
- **Video timestamp:** 00:45-01:10
- **Relevant files**
   - yoga-app\components\homeLocationRecommendations.jsx
         this defines how to request to get user's location and how to match the nearby suburb courses to reccomend
   - yoga-app\app\index.jsx
         this designed how the location based reccomendation courses display on home screen.
