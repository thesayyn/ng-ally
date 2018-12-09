#!/usr/bin/env bash
#Taken from https://github.com/angular/angular/blob/master/build.sh
set -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)
cd "$currentDir"

PACKAGES=(
  platform-server
  router
  database
  storage
  devkit
  schematics
  socket
)

TSC_PACKAGES=(
  devkit
  schematics
)

NODE_PACKAGES=(null)

BUILD_ALL=true
BUNDLE=true
VERSION_PREFIX=$(node -p "require('./package.json').version")
VERSION_SUFFIX="-$(git log --oneline -1 | awk '{print $1}')"
COMPILE_SOURCE=true
TYPECHECK_ALL=true

for ARG in "$@"; do
  case "$ARG" in
    --quick-bundle=*)
      COMPILE_SOURCE=false
      TYPECHECK_ALL=false
      ;;
    --packages=*)
      PACKAGES_STR=${ARG#--packages=}
      PACKAGES=( ${PACKAGES_STR//,/ } )
      BUILD_ALL=false
      ;;
    --bundle=*)
      BUNDLE=( "${ARG#--bundle=}" )
      ;;
    --publish)
      VERSION_SUFFIX=""
      ;;
    --compile=*)
      COMPILE_SOURCE=${ARG#--compile=}
      ;;
    --typecheck=*)
      TYPECHECK_ALL=${ARG#--typecheck=}
      ;;
    *)
      echo "Unknown option $ARG."
      exit 1
      ;;
  esac
done

#######################################
# Verifies a directory isn't in the ignored list
# Arguments:
#   param1 - Path to check
# Returns:
#   Boolean
#######################################
isIgnoredDirectory() {
  name=$(basename ${1})
  if [[ -f "${1}" || "${name}" == "src" || "${name}" == "test" || "${name}" == "integrationtest" || "${name}" == "locales" ]]; then
    return 0
  else
    return 1
  fi
}

#######################################
# Check if array contains an element
# Arguments:
#   param1 - Element to check
#   param2 - Array to look for element in
# Returns:
#   None
#######################################
containsElement () {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

#######################################
# Recursively compile package
# Arguments:
#   param1 - Source directory
#   param2 - Out dir
#   param3 - Package Name
# Returns:
#   None
#######################################
compilePackage() {
  # For TSC_PACKAGES items
  if containsElement "${3}" "${TSC_PACKAGES[@]}"; then
    echo "======      [${3}]: COMPILING: ${TSC} -p ${1}/tsconfig-build.json"
    $TSC -p ${1}/tsconfig-build.json
  else
    echo "======      [${3}]: COMPILING: ${NGC} -p ${1}/tsconfig-build.json"
    local package_name=$(basename "${2}")
    $NGC -p ${1}/tsconfig-build.json
  fi

  # Build subpackages
  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    BASE_DIR=$(basename "${DIR}")
    # Skip over directories that are not nested entry points
    [[ -e ${DIR}/tsconfig-build.json && "${BASE_DIR}" != "integrationtest" ]] || continue
    compilePackage ${DIR} ${2}/${BASE_DIR} ${3}
  done
}

#######################################
# Recursively compile package
# Arguments:
#   param1 - Source directory
#   param2 - Out dir
#   param3 - Package Name
# Returns:
#   None
#######################################
compilePackageES5() {
  if containsElement "${3}" "${TSC_PACKAGES[@]}"; then
    echo "======      [${3}]: COMPILING: ${TSC} -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap"
    local package_name=$(basename "${2}")
    $TSC -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap
  else
    echo "======      [${3}]: COMPILING: ${NGC} -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap"
    local package_name=$(basename "${2}")
    $NGC -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap
  fi

  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    BASE_DIR=$(basename "${DIR}")
    # Skip over directories that are not nested entry points
    [[ -e ${DIR}/tsconfig-build.json && "${BASE_DIR}" != "integrationtest" ]] || continue
    compilePackageES5 ${DIR} ${2} ${3}
  done
}

#######################################
# Adds a package.json in directories where needed (secondary entry point typings).
# This is read by NGC to be able to find the flat module index.
# Arguments:
#   param1 - Source directory of typings files
# Returns:
#   None
#######################################
addNgcPackageJson() {
  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    # Confirm there is an ${PACKAGE}.d.ts and ${PACKAGE}.metadata.json file. If so, create
    # the package.json and recurse.
    if [[ -f ${DIR}/${PACKAGE}.d.ts && -f ${DIR}/${PACKAGE}.metadata.json ]]; then
      echo '{"typings": "${PACKAGE}.d.ts"}' > ${DIR}/package.json
      addNgcPackageJson ${DIR}
    fi
  done
}

updateVersionReferences() {
  NPM_DIR="$1"
  (
    echo "======      VERSION: Updating version references in ${NPM_DIR}"
    cd ${NPM_DIR}
    echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-PLACEHOLDER/${VERSION}/g\" $""(grep -ril 0\.0\.0\-PLACEHOLDER .)"
    perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
  )
}

#######################################
# Adds banners to all files in a directory
# Arguments:
#   param1 - Directory to add license banners to
# Returns:
#   None
#######################################
addBanners() {
  for file in ${1}/*; do
    if [[ -f ${file} && "${file##*.}" == "js" ]]; then
      cat ${LICENSE_BANNER} > ${file}.tmp
      cat ${file} >> ${file}.tmp
      mv ${file}.tmp ${file}
    elif [[ -d ${file} ]]; then
      addBanners ${file}
    fi
  done
}

#######################################
# Drops the last entry of a path. Similar to normalizing a path such as
# /parent/child/.. to /parent.
# Arguments:
#   param1 - Directory on which to drop the last item
# Returns:
#   None
#######################################
dropLast() {
  local last_item=$(basename ${1})
  local regex=local regex="(.+)/${last_item}"
  if [[ "${1}" =~ $regex ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "${1}"
  fi
}

VERSION="${VERSION_PREFIX}${VERSION_SUFFIX}"
echo "====== BUILDING: Version ${VERSION}"

TSC=`pwd`/node_modules/.bin/tsc
NGC="node --max-old-space-size=3000 `pwd`/node_modules/.bin/ngc"
UGLIFY=`pwd`/node_modules/.bin/uglifyjs

if [[ ${BUILD_ALL} == true && ${TYPECHECK_ALL} == true ]]; then
  rm -rf ./dist/all/
  rm -rf ./dist/packages
  mkdir -p ./dist/all/
fi

if [[ ${BUILD_ALL} == true ]]; then
  rm -rf ./dist/packages
  if [[ ${BUNDLE} == true ]]; then
    rm -rf ./dist/packages-dist
  fi
fi

if [[ ${BUILD_ALL} == true ]]; then
  mkdir -p ./dist/packages-dist
fi

for PACKAGE in ${PACKAGES[@]}
do

  PWD=`pwd`
  ROOT_DIR=${PWD}/packages
  SRC_DIR=${ROOT_DIR}/${PACKAGE}
  ROOT_OUT_DIR=${PWD}/dist/packages
  OUT_DIR=${ROOT_OUT_DIR}/${PACKAGE}
  OUT_DIR_ESM5=${ROOT_OUT_DIR}/${PACKAGE}/esm5
  NPM_DIR=${PWD}/dist/packages-dist/${PACKAGE}
  ESM2015_DIR=${NPM_DIR}/esm2015
  FESM2015_DIR=${NPM_DIR}/fesm2015
  ESM5_DIR=${NPM_DIR}/esm5
  FESM5_DIR=${NPM_DIR}/fesm5

  LICENSE_BANNER=${PWD}/license-banner.txt

  if [[ ${COMPILE_SOURCE} == true ]]; then
    rm -rf ${OUT_DIR}
    rm -f ${ROOT_OUT_DIR}/${PACKAGE}.js
    compilePackage ${SRC_DIR} ${OUT_DIR} ${PACKAGE}
  fi

  if [[ ${BUNDLE} == true ]]; then
    echo "======      BUNDLING ${PACKAGE}: ${SRC_DIR} ====="
    rm -rf ${NPM_DIR} && mkdir -p ${NPM_DIR}

    if ! containsElement "${PACKAGE}" "${NODE_PACKAGES[@]}"; then

      echo "======        Copy ${PACKAGE} typings"
      rsync -a --exclude=*.js --exclude=*.js.map ${OUT_DIR}/ ${NPM_DIR}

      (
        if ! containsElement "${PACKAGE}" "${TSC_PACKAGES[@]}"; then
          cd  ${SRC_DIR}
          echo "======         Copy ESM2015 for ${PACKAGE}"
          rsync -a --exclude="**/*.d.ts" --exclude="**/*.metadata.json" ${OUT_DIR}/ ${ESM2015_DIR}

          echo "======         Produce ESM5 version"
          compilePackageES5 ${SRC_DIR} ${OUT_DIR_ESM5} ${PACKAGE}
          rsync -a --exclude="**/*.d.ts" --exclude="**/*.metadata.json" ${OUT_DIR_ESM5}/ ${ESM5_DIR}
        else 
          echo "======        Copy ${PACKAGE}"
          rsync -amr ${OUT_DIR}/ ${NPM_DIR}
        fi
  
        if [[ -e ${SRC_DIR}/build.sh ]]; then
          echo "======         Custom build for ${PACKAGE}"
          cd ${SRC_DIR} && ${SRC_DIR}/build.sh
        fi

      ) 2>&1 | grep -v "as external dependency"

    else
      echo "======        Copy ${PACKAGE} node tool"
      rsync -a ${OUT_DIR}/ ${NPM_DIR}
    fi

    echo "======        Copy ${PACKAGE} package.json and .externs.js files"
    rsync -am --include="package.json" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/
    rsync -am --include="*.externs.js" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/

    if [ ${PACKAGE} = "devkit" ] ||  [ ${PACKAGE} = "schematics" ]; then
    echo "======        Copy ${PACKAGE}  schema.json and builders.json files"
      rsync -ar --include="schema.json" --include="builders.json" --include="collection.json" --include='*/' --exclude=* ${SRC_DIR}/ ${NPM_DIR}/
      rsync -amr --include='**/files/**' --include='*/' --exclude=* ${SRC_DIR}/ ${NPM_DIR}/
    fi

    echo "======        Add banners ${PACKAGE}"
    addBanners ${NPM_DIR}

    echo "======        Copy ${PACKAGE}  README.md file"
    cp ${PWD}/README.md ${NPM_DIR}/
  fi


  if [[ -d ${NPM_DIR} ]]; then
    updateVersionReferences ${NPM_DIR}
  fi

done
