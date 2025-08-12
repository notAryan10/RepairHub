# 🛠 RepairHub – Central Place for All Repair Requests

## 1. 🚀 Project Title
RepairHub – Central Place for All Repair Requests

## 2. 👤 Name & Roll Number
Aryan Verma – 2024-B-09082006B

## 3. 📌 Problem Statement
In hostels, students often report maintenance issues (plumbing leaks, electrical faults, Wi-Fi problems, broken furniture) verbally or on paper.  
This causes:  
- Delays in repairs due to lack of proper tracking  
- Miscommunication between students, wardens, and staff  
- No clear record of recurring or unresolved issues  

There is no centralized, transparent, and quick system to log, track, and update repair requests.

## 4. ✅ Proposed Solution
A React Native mobile app that allows residents to instantly report maintenance issues with photos, track the repair progress, and receive notifications when issues are resolved.

The system will:
- Store structured data (issues, users, room details) in MySQL  
- Store unstructured data (images, logs, feedback) in MongoDB  
- Use role-based access for Students, Wardens, and Staff  
- Send push notifications for updates  

## 5. 🔑 Key Features
- **One-Tap Issue Reporting** – Upload photo, write description, and choose category (Plumbing, Electrical, Furniture, Wi-Fi, Other).  
- **Push Notifications** – Real-time alerts when an issue’s status changes.  
- **Live Issue Tracking** – Status updates with timestamps.  
- **Role-Based Dashboards** –  
  - Students: Log/view own issues  
  - Wardens: View all hostel issues and assign staff  
  - Staff: Update repair progress  
- **Recurring Issue Detection** – Flag issues repeatedly reported in the same room/block.  
- **Feedback System** – Students can mark “Satisfied” or “Not Satisfied” after repair.  
- **Offline Mode** – Save issue locally and sync when online.  

## 6. 🎯 Target Users / Audience
- Hostel students  
- Wardens and hostel admins  
- Maintenance staff  

## 7. 💻 Technology Stack
- **Frontend (Mobile App):** React Native  
- **Backend:** Node.js + Express.js  
- **Database:**  
  - MySQL → Issues, users, room details, staff assignments  
  - MongoDB → Images, logs, feedback, activity history  
- **Notifications:** Firebase Cloud Messaging (FCM)  
- **Authentication:** Firebase Auth or JWT-based system  
- **File Storage:** Firebase Storage / AWS S3 (for images)  
- **Hosting:** Railway / AWS / Firebase Hosting  

## 8. 💯 Expected Outcome
A fully functional mobile app where students can log issues in seconds, wardens can manage them efficiently, and repairs are completed faster with transparency.

## 9. 📅 Timeline
- **Week 1–2:** Requirement gathering, UI/UX design  
- **Week 3–4:** Backend setup, MySQL + MongoDB integration  
- **Week 5:** Image upload system (Firebase Storage / AWS S3)  
- **Week 6:** Push notification setup (FCM)  
- **Week 7:** Authentication & role-based access control  
- **Week 8:** Dashboard integration for students, wardens, and staff  
- **Week 9:** Testing, bug fixing, and optimization  
- **Week 10:** Deployment & final presentation  

## 10. 📌 Future Scope
- AI-based issue categorization from description/photos  
- QR code scanning for quick reporting from specific rooms  
- Repair budget and cost tracking  
- Multi-language support for staff  
