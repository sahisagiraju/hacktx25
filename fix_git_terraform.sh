set -e
if ! grep -q '\.terraform/' .gitignore 2>/dev/null; then
  cat >> .gitignore <<'EOF'

# Terraform
**/.terraform/
*.tfstate
*.tfstate.*
crash.log
override.tf
override.tf.json
.terraformrc
terraform.rc
EOF
  git add .gitignore || true
  git commit -m "chore(terraform): ignore .terraform and state files" || true
fi
git rm -r --cached --ignore-unmatch infra/terraform/.terraform || true
git rm -r --cached --ignore-unmatch **/.terraform || true
git commit -m "chore(terraform): stop tracking .terraform artifacts" || true

# Safety tag
git tag -f pre-terraform-purge || true

# Rewrite history to remove ALL .terraform blobs from every commit
git filter-repo --force --path-glob '**/.terraform/*' --invert-paths

# Push rewritten history
branch="$(git rev-parse --abbrev-ref HEAD)"
git push origin "$branch" --force-with-lease
