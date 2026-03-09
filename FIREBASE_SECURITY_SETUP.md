# Firebase Security Setup

1. Deploy the Realtime Database rules in [database.rules.json](/c:/Users/king/Projects/buildifyrestaurantsample/database.rules.json).
   Command: `firebase deploy --only database`

2. In Firebase Authentication, enable `Email/Password` for staff sign-in.

3. Create the staff accounts you want to use for the admin and kitchen views.

4. After each staff user exists, add an allowlist record in Realtime Database:

```json
{
  "staffMembers": {
    "FIREBASE_AUTH_UID": {
      "active": true,
      "email": "staff@example.com",
      "name": "Kitchen Lead",
      "role": "Manager"
    }
  }
}
```

5. Regenerate or reprint QR codes from the admin dashboard after the table `accessCode` values have been backfilled.

Notes:
- Customer access is now scoped by per-table `access` codes in the QR URLs.
- Staff access depends on both Firebase Auth sign-in and a matching `/staffMembers/{uid}` allowlist record.
