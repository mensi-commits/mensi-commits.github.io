---
title: 'Old Sessions - picoCTF (picoGym) Writeup'
description: 'Old Sessions - picoCTF (picoGym) Writeup'
date: 2026-04-24T19:31:00+01:00
tags: ['CTF', 'cybersecurity']
authors: ['mensi']
image: ../assets/pico-ctf/old-sessions/2.png
draft: false
maths: true
---

# **Old Sessions - picoCTF (picoGym) Writeup**

## **Description**

![Alt text](../assets/pico-ctf/old-sessions/1.png)

## **Solution**

<img src="/assets/pico-ctf/old-sessions/tenor.gif" width="500px" alt="oh-my-god">

In this challenge we are given a login & register page.

![Alt text](../assets/pico-ctf/old-sessions/3.png)

The description of the challenge mentions an old session, so the first thing i did is register and login using dummy creds.

![Alt text](../assets/pico-ctf/old-sessions/5.png)

![Alt text](../assets/pico-ctf/old-sessions/6.png)

After a successful login i found a user `mary_jones_8992` with a description says `Hey I found a strange page at /sessions` which clearly mentions a `/sessions` route.

![Alt text](../assets/pico-ctf/old-sessions/7.png)

Visiting the `/sessions` route i found the `admin` sessions ID.

<img src="/assets/pico-ctf/old-sessions/omg-oh-my-god.gif" width="500px" alt="oh-my-god">

![Alt text](../assets/pico-ctf/old-sessions/8.png)

i changed my session ID with the admin session ID in the browser `Cookies` in `Application` panel.

![Alt text](../assets/pico-ctf/old-sessions/9.png)

Refreshing the page i got the flag :))))))))

![Alt text](../assets/pico-ctf/old-sessions/10.png)

![Alt text](../assets/pico-ctf/old-sessions/11.png)

## **Flag**

```
picoCTF{s3t_s3ss10n_3xp1rat10n5_7139c037}
```

![Alt text](../assets/pico-ctf/old-sessions/12.jpg)
