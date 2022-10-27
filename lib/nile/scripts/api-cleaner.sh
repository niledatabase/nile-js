#!/bin/bash

# make workspace optional (hacky)
sed -i -e '2264s/required: true/required: false/' ./spec/api.yaml
