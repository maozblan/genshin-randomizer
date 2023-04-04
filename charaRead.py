#this program reads all the files in /images/character and makes the
#dataChara.json file in /subpages
import os
import json

pictures = []

for x in os.listdir('./images/character'):
    pictures.append({"name": x[:-5], "img": ("./images/character/" + x), "pfp": ("./images/pfp/" + x)})

#make into object
jsonObject = json.dumps(pictures, indent=2)

with open('./subpages/dataChara.json', 'w') as outfile:
    outfile.write(jsonObject)