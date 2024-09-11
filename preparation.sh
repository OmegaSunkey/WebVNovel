#!/bin/bash 

config="`cat config.json`"

temp="  \"list\": ["

for i in ./images/*/*; do
  temp+="\"${i:1}\", "
  echo "${i:1}"
done
#echo "${config:0:-2},"

if [[ "$config" =~ "list" ]]; then
	echo "Removing old list from config.json"
	new=`sed -E 's/"list":.*?//g' config.json`
	echo "${new:0:-5}"
	echo "Adding new list to config.json"
	config="${new:0:-5}"
	config=$(printf '%s\nq' "${config}")
	config=${config%q}
	config+="${temp/%, /]}"
	printf '%s' "$config" > config.json
	echo >> config.json
	echo '}' >> config.json
else
	config="${config:0:-2},"
	config=$(printf '%s\nq' "${config}")
	config=${config%q}
	echo "Adding list to config.json"
	config+="${temp/%, /]}"
	echo "$config"
	#echo "" >> config.json
	printf '%s' "$config" > config.json
	echo "" >> config.json
	echo '}' >> config.json
fi

echo "array ${temp/%, /]\}} has been made for you in config.json!"
#echo "${temp/%, /]}" > list.json
