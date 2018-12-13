DIR='./dist/packages-dist/*'
for DIRECTORY in $DIR; do
    echo "========== Publishing ${DIRECTORY##*/}"
    npm publish $DIRECTORY --access=public
done