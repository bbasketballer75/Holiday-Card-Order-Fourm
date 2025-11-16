# Move project to D: drive (optional)

If you want to move the project from the current location to the `D:` drive, run the following PowerShell commands (Windows):

```powershell
# Create a destination folder (if not exists)
New-Item -ItemType Directory -Path "D:\Projects\friendly-city-print-shop" -Force

# Stop any running dev servers in the folder
# Copy files from current folder to destination
Copy-Item -Path "f:\wedding-website\friendly-city-print-shop\*" -Destination "D:\Projects\friendly-city-print-shop" -Recurse -Force

# (Optional) Remove origin after you confirm the copy
# Remove-Item -Path "f:\wedding-website\friendly-city-print-shop" -Recurse -Force
```

After moving, open the folder in VS Code and run `npm install` then `npm run dev`.

If you'd like me to attempt a file copy to D: now, please confirm and ensure the environment's write access is allowed for the D: drive.
