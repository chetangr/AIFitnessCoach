Issues Found:

Overall:
1. No way to add user name/password, the databse data should be unique to the user, so If a user logs out and logs in after a few days the data should persist.
2. Need to implement onboarding, doesn't have to work right away, refer to questions in  "/Users/chetangrandhe/Desktop/AIFitnessCoach/test_images/WhatsApp*.jpeg"
3. Might be a nice idea to talk with the selected AI Coach after onboarding. Would be a text.
4. Need to collect the why and the goal for workout and program.
5. Need to write flutter test cases to test the app. need to test scalability before deploying to prod.

In the schedule tab:
1. Expecting the workout in schedule page to be like "/Users/chetangrandhe/Desktop/AIFitnessCoach/test_images/workout of the day.jpeg"
3. Need a very natural voice maybe use google speech instead of tts?
4. ![There is still an issue after clicking on a workout on schedule page](image.png)
5. ![wouldn't it be nice if there is a play button on top right corner after clicking on a workout on schedule page?](image-1.png)
6. I think a preview of exercise below each workout after clicking on a workout on schedule page would be helpful, I do not have the preview of workouts as videos but createa temporary ones for now, so each of the 10000+ exercise should have it's own video.
7. ![I do not like this "Your Weekly Workout page](image-2.png) would be better if it's a text on the left top corner, would be nice if you could add streak on the top right corner.
8. Must have to have a plus icon to add exercisese to the workout program after clicking on a workout on schedule page.
9. Must have to have a save icon to add workout program to the saved list of the profile. If there is no saved list create one in db per user. Mkae sure you record all the columns in the local database.
10. The workout programs must have warmups and stretches in the workout programs.

In the Exercises Tab:
1. Need a button to add custom exercise.
2. ![Clicking add to workout in exercise tab doesn't add to workout present for that current day and program, like on tuesday if I have a beach pool party workout program on my schedule and want to add pushups from exercise tab is not able to do that](image-3.png)
3. ![Why are the rest between sets like 70 seconds?](image-3.png)
4. ![The filter is not getting properly are all the exercises stored in the database properly with muscle category/body part, difficulty, execrise category(liek bodyweight, kegels etc.,) all these should also be in filters](image-4.png)
5. ![I typed in push and no workout shows, I would expect atlease push up shows up, The search button doesn't work properly](image-5.png) 
6. I do not think all the 10000 workouts are being displayed?

In AI Coach Tab:
1. The AI should always check in with the user everyday to see if they're active and if they would finsh up the program assigned to current day. It must be able to read the weekly scheulde. 
2. AI coach must also reply to the user based on user stats(like bmi, number of workouts finished, streak, how many calories burnt etc).
3. The AI Coach should send an appreciating message if a workout is done, it much also say how many cl=alories were burnt, longest time spent in particualr part of the workout, and othe ruser useful stats you think are necessary to motivate the user.
4. AI Coach should be able to take images from user where user would upload their food intake, calorie intake etc and suggest what needs done next based all the nutrition and workout stats, AI Coach should remind everyday to the user to send the myfitnesspal images or nutrition stats.
5. ![Not able to edit workout program in schedule based on chat from the AI Coach, instead it gives a json where an average user wont be able to understand, same with the other buttons, they don't function like required onlys sends a chat to AI Coach](image-6.png)
6. ![It was not able to answer if asked "how am I doing with fitness", being a being app the coach shpuld have access to all the information like diet etc to be able to answer this question](image-7.png)

Didn't review Profile and Progress pages yet, I hope all the buttons and every small thing works with them and hopefully they do not disappoint me.

Update documentation for all documents after all these are done.