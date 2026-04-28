---
title: 'Pterodactyl - Hack The Box Writeup (Linux, Medium)'
description: 'Pterodactyl HTB Machine Writeup - exploitation walkthrough and key steps'
date: 2026-04-28T01:15:00+01:00
tags: ['HTB', 'Linux', 'Writeup', 'Medium']
authors: ['mensi']
image: ../assets/htb/pterodactyl/1.png
draft: false
maths: true
---

# Pterodactyl — Hack The Box Writeup (Linux, Medium)

“A machine about dinosaurs. Not the cool ones. The ones that store passwords in plaintext.”

---

## 1. Initial Recon

We start with the usual ritual: scan the machine, act surprised when ports are open, then pretend this was all part of the plan.

Command used:

```bash
nmap -sCV -A 10.129.2.65
```

Nmap confirms the machine is alive and bored. The scan reveals only two open ports:

22/tcp SSH
80/tcp HTTP

The important part was not the ports. The important part was the redirect:

The web server refused to serve content directly and redirected to:

[http://pterodactyl.htb](http://pterodactyl.htb)

Meaning the server is using virtual hosts. In other words, the machine is picky about its name.

At this point we already know:

If it’s a Linux HTB box and it has a redirect domain, there is probably an admin panel hiding like a coward.

---

## 2. Fixing the Redirect (Hosts File)

Since pterodactyl.htb is not a real public domain, we add it manually.

```bash
echo "10.129.2.65 pterodactyl.htb" | sudo tee -a /etc/hosts
```

Now the browser finally loads the website.

---

## 3. Virtual Host Enumeration

Visiting the website shows a redirect to another hostname:

play.pterodactyl.htb

So we add it too:

```bash
echo "10.129.2.65 play.pterodactyl.htb" | sudo tee -a /etc/hosts
```

Now visiting:

[http://play.pterodactyl.htb](http://play.pterodactyl.htb)

We are greeted with a Minecraft landing page called MonitorLand.

This is where the machine tries to act innocent.

But if you see “Minecraft server panel”, you know what’s coming.

Somewhere, there is a management panel full of pain and bad coding decisions.

---

## 4. Subdomain Enumeration (ffuf)

At this point, the machine clearly has multiple subdomains. The best approach is to brute force them.

We run ffuf using Host header fuzzing:

```bash
ffuf -u http://play.pterodactyl.htb -H "Host: FUZZ.pterodactyl.htb" \
-w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 145
```

The filter `-fs 145` was used to remove the default response size returned by non-existing subdomains.

Result:

panel.pterodactyl.htb returned HTTP 200.

So we add it:

```bash
echo "10.129.2.65 panel.pterodactyl.htb" | sudo tee -a /etc/hosts
```

Now we visit:

[http://panel.pterodactyl.htb](http://panel.pterodactyl.htb)

And of course, it’s a login page.

This is where the machine says:

“Please authenticate.”

And we say:

“No.”

---

## 5. Panel Enumeration

The panel login endpoint is located at:

[http://panel.pterodactyl.htb/auth/login](http://panel.pterodactyl.htb/auth/login)

It’s clearly Pterodactyl Panel, a Laravel-based game server management platform.

Since we don’t have credentials, the correct HTB method is:

Step 1: Google
Step 2: pretend it’s “research”
Step 3: win

So we search for known vulnerabilities affecting Pterodactyl Panel.

That’s when we find the machine’s biggest mistake:

CVE-2025-49132

---

## 6. CVE-2025-49132 Discovery

The vulnerability affects the locale loading endpoint:

/locales/locale.json

This endpoint is used to load translations, but the developers forgot one small detail:

Input validation.

So instead of loading language files, it can load files from anywhere on disk.

This is not a bug. This is a feature for hackers.

We test the endpoint manually:

```bash
curl -v "http://panel.pterodactyl.htb/locales/locale.json"
```

It responds with HTTP 200 and gives session cookies.

The panel is literally giving us cookies before we even log in.

Very polite.

Very stupid.

---

## 7. Vulnerability Validation

We grabbed a public proof-of-concept exploit and ran it in test mode.

The result confirmed the target was vulnerable.

The exploit indicates the application path is accessible via traversal:

../../../pterodactyl

So now we know we can read sensitive files.

This is the part where the machine starts crying.

---

## 8. Dumping Secrets (Config Leak)

Using the exploit’s dump mode, we retrieved internal Laravel configuration files.

The important loot was:

APP_KEY
Database credentials

The app configuration leak exposed:

APP_ENV production
APP_URL panel.pterodactyl.htb
CIPHER AES-256-CBC
APP_KEY base64:...

The database configuration leak exposed:

Username: pterodactyl
Password: PteraPanel
Host: 127.0.0.1
Database: panel

At this point the machine is already half-dead.

If you leak Laravel APP_KEY, the application is basically compromised spiritually.

---

## 9. Remote Code Execution

Further exploitation of the same vulnerability chain allowed command execution through the panel.

This led to a shell as the web user:

wwwrun

Now we have foothold.

Now we begin the true HTB experience:

Enumerate until something breaks.

---

## 10. Post Exploitation Enumeration

Once inside the machine, we land in:

/var/www/pterodactyl/public

The first thing to do is always move one directory up and check for configuration files.

Inside:

/var/www/pterodactyl

We find the .env file.

Laravel applications store all secrets there because developers love pain.

Reading it confirms everything:

APP_KEY is present
DB_PASSWORD is present
Redis settings are present

So the box is not only vulnerable.

It is also extremely generous.

---

## 11. Database Access

The .env file confirms MariaDB credentials:

DB_USERNAME=pterodactyl
DB_PASSWORD=PteraPanel
DB_DATABASE=panel

Database is local on 127.0.0.1.

So database access is possible from inside the machine.

After connecting, we enumerate the tables.

The important one is obvious:

users

Because nothing screams “loot” like a users table.

---

## 12. Dumping Users Table

Querying the users table reveals two accounts:

headmonitor (admin)
phileasfogg3 (normal user)

The passwords are stored as bcrypt hashes.

This is where the machine thinks it is safe.

But bcrypt doesn’t save you if the password is trash.

And one password was trash.

---

## 13. Password Cracking

We extracted the bcrypt hashes and used John the Ripper with rockyou.txt.

One password cracked successfully:

!QAZ2wsx

This password is the reason password policies exist.

It’s also the reason IT departments drink.

---

## 14. SSH Access

We test the password against SSH using the usernames found.

It works for:

phileasfogg3

So we get SSH access.

At this point we have stable shell access and can grab the user flag.

User flag is located in:

/home/phileasfogg3/user.txt

Flag obtained.

Now we move to the real objective:

Become root.

Because user access is for normal people.

---

## 15. Privilege Escalation Hint (Mail)

We check system mail because admins love leaving clues there like they’re writing fanfiction.

In:

/var/mail/

We find mail for:

headmonitor
phileasfogg3

Reading phileasfogg3’s mail reveals something interesting:

A security notice about unusual udisksd activity.

Translation:

“Hello hacker, privilege escalation is here.”

---

## 16. Privilege Escalation Research

udisksd is a privileged daemon for disk management.

That’s already suspicious because disk tools and privilege escalation go together like:

developers and mistakes.

Research reveals a privilege escalation chain involving:

CVE-2025-6018
CVE-2025-6019

This chain allows a local attacker to escalate privileges to root.

The machine is basically running an outdated and vulnerable udisks/libblockdev setup.

Which means root is possible.

---

## 17. Root Access

Using the exploit chain, the system allows creation of a root-owned SUID bash.

Once executed, we obtain a root shell.

Checking identity confirms:

euid=0(root)

Root flag is located at:

/root/root.txt

Flag obtained.

Machine fully compromised.

---

## 18. Root Cause Analysis

This machine dies because of multiple catastrophic mistakes stacked together:

Exposed management panel to the internet
Known CVE not patched (CVE-2025-49132)
Arbitrary file read via locale endpoint
Plaintext database credentials leaked
Weak user password reused for SSH
Outdated udisks/libblockdev vulnerabilities allowing local root escalation

This is not “one vulnerability”.

This is a full buffet of security failures.

---

## 19. Final Thoughts

This machine teaches one important lesson:

You don’t need 0days if the system is held together by duct tape and hope.

The web application leak was enough to compromise the database.

The database was enough to compromise user credentials.

The credentials were enough to get SSH.

The local system was unpatched enough to escalate to root.

Everything chained perfectly.

Like a dinosaur fossil chain reaction.

---

## Meme Image Ideas to Insert

Image of a dinosaur holding a password sticky note
Text: “Pterodactyl Panel Security Team”

Image of a vault labeled “.env” with the door wide open
Text: “Configuration management”

Image of a keyboard with QAZ highlighted
Text: “Password policy? never heard of her”

Image of a sysadmin writing an email while the server is on fire
Text: “We detected suspicious activity. We will ignore it.”

Image of a hacker sitting calmly while the panel leaks secrets
Text: “When the locale file speaks too much”

Image of a baby dinosaur with sunglasses
Text: “root.txt acquired”

---

End of writeup.

Pterodactyl owned.

The dinosaur went extinct again.
