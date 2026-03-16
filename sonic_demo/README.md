# Demo requires following this guide:

https://aws.amazon.com/blogs/machine-learning/build-real-time-conversational-ai-experiences-using-amazon-nova-sonic-and-livekit/


# Some gotchas
1. you'll need to have an aws account, bedrock, a "user" for bedrock, and then the aws key/secret
2. if you don't have brew, for linux you have to ensure you install both the cli and server
3. for local host use ws instead of wss (which is what the defualt text in livekit playgound)
4. your livekit server might die/exit unexpectadly so check that it's running if you have problems
5. make sure the main function is running, and add the livekit url to the env as well