# Backend setup (about 10 minutes, free)

Requests go into a Google Sheet that only you (and people you add) can edit. It opens like Excel and exports to .xlsx.

1. Go to https://sheets.google.com and create a blank sheet named "WorksheetHub AI Data".
   (Optional: File > Import > upload `WorksheetHub-Requests-template.xlsx`. Not required.)
2. In the sheet: Extensions > Apps Script. Delete the default code, paste in all of `backend/Code.gs`, and save.
3. Pick `setup` in the function dropdown and click Run. Approve the permissions (Sheets and Drive).
   This creates the tabs Requests, Worksheets, Feedback, Users and a Drive folder "WorksheetHub Files".
4. Open the **Users** tab. Your admin access token is in column B. Keep it secret. This is your login.
5. Deploy > New deployment > type "Web app". Execute as: **Me**. Who has access: **Anyone**. Deploy, then copy the Web app URL.
6. Put the URL in `config.js` as `apiUrl`, and the sheet's address as `sheetUrl`. Set `showSampleData: false`. Push to GitHub.
7. Open the site > footer "Admin" and log in with your token.

## Contributors
Add a row in the Users tab: name, a long random token (any random string, 20+ characters), role `contributor`.
Contributors can see and edit requests, upload files and add worksheets. Only admins can delete.
Remove their row to revoke access.

## Notes
- The token is your password: anyone with it has that access. Do not post it or commit it.
- After changing Code.gs, use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
- Uploaded files go to the Drive folder "WorksheetHub Files" (link-shareable, max 20 MB each).
- Excel copy: in the Sheet, File > Download > Microsoft Excel (.xlsx).
