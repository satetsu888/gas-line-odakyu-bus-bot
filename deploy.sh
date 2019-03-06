clasp push
clasp version
clasp versions > .versions
LAST_VERSION=$(cat .versions | grep -v "~" | head -n 1 | cut -d " " -f 1)
DEPLOYMENT_ID=`clasp deployments | grep "web app meta-version" | cut -d " " -f 2`
echo deploy @${LAST_VERSION} to ${DEPLOYMENT_ID}
clasp deploy --versionNumber ${LAST_VERSION} --deploymentId ${DEPLOYMENT_ID} --description "web app meta-version"
