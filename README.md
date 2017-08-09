##Openid passport – proxy 

1. Client will register IP’s details to the server using GUI by ox-trust.
    (0:20 to 0:35 in video)
![](/images/Screenshot4.png)
![](/images/Screenshot5.png)

2. passport-proxy server will fetch detail using passport-config.JSON which is created by gluu server it self during installation.

3. Here passportConfigAPI is UMA protected to the passport-proxy server will also do processes for UMA.
![](/images/Passportconfigjson.png)

4. The client can have UI like this for login using a proxy server.
    (0:45 in video)
![](/images/Proxy-docs.png)
Here we can see that client has created to buttons to log in two different IP’s using the passport-proxy server.	
5. When user will client on click on Any of button to login client will call send get a request to the proxy server. 
<br><u>For ex. .../auth/openidconnect?clientID=@!2EA3.DABD.58DD.487D!0001!DF6B.BF9B!0008!BCFE.DAC7.E3BE.E4A3&state=eyJvcCI6Imh0dHBzOi8vZXJhc211c2Rldi5nbHV1Lm9yZyIsInN0YXRlIjoiMTNWcVFVUUh1ZSJ9
<br><br>state = “base 64 of op and random state.</u><br>
6. Passport server will try to match clientid from predefined configurations and initialize passport strategy for According to matching configurations from oxTrust.

7. Using passport Authentication strategy user will be redirected to IP’s login page.
(1:15 for ce-dev IP and 0:55 for erasmus IP in video)
![](/images/Proxy-docs1.png)
8. Here redirect URI must be an end point of the proxy server because passport will require Token from redirected URI to fetch user info.
9. After successful login passport server will be call user-info API and fetch user info.
10. The server will check if user entry is available or not and Will create a new entry if not available.
11. After storing info to local-LDAP, the proxy server will also create an expairable key pair entry to Redis server.
12. The server will send Redis key to the client as a token to get user info.
13. The client will be able to fetch user info using the same token as far as Token is not expired.
      (1:10 in for ce-dev and 1:44 in Erasmus in video)
![](/images/Screenshot3.png)



<B>Link for Video </B>:- https://drive.google.com/file/d/0B6Iki_STqg-jbjc4YTJ3cm9DSk0/view