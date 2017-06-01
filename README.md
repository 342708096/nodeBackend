#GVR Backend
1. install mongo
   docker pull mongo
2. start mongo
   docker run -p 27017:27017 -v $PWD/db:/data/db -d mongo
3. start server:
   node .

