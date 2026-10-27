import os
import sys
import zipfile

src_dir = os.path.abspath(r'c:\Users\bisma\Documents\GitHub\codelifeai_portfolio\client\dist')
zip_path = os.path.abspath(r'c:\Users\bisma\Documents\GitHub\codelifeai_portfolio\hostinger_build.zip')

if os.path.exists(zip_path):
    os.remove(zip_path)

print(f"Packaging {src_dir} into {zip_path} with standard POSIX forward-slash paths...")

entry_count = 0
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, src_dir)
            # CRITICAL: Always use '/' forward slashes for ZIP entries so Linux web servers
            # (Hostinger, Apache, cPanel, Nginx) create folders properly and don't flatten paths!
            arcname = rel_path.replace('\\', '/')
            zf.write(full_path, arcname)
            entry_count += 1
            print(f"  + {arcname}")

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"\n[SUCCESS] hostinger_build.zip created successfully!")
print(f"Total files: {entry_count}")
print(f"Zip size: {size_mb:.2f} MB")
