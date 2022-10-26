#!/bin/bash

# make workspace optional (hacky)
sed -i -e '2273s/required: true/required: false/' ./spec/api.yaml
