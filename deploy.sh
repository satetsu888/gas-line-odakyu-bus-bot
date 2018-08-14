clasp push
clasp version
clasp versions > .versions
LAST_VERSION=$(cat .versions | grep -v "~" | head -n 1 | cut -d " " -f 1)
DEPLOYMENT_ID=`clasp deployments | grep "web app meta-version" | cut -d " " -f 2`
echo deploy @${LAST_VERSION} to ${DEPLOYMENT_ID}
clasp redeploy ${DEPLOYMENT_ID} ${LAST_VERSION} "web app meta-version"
