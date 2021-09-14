# simba_empire_auto_train

**⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️ <br/>
If you share the private key with a stranger, you will lose all your money, so you need to keep it carefully. You need to understand the source code to enter the private key. <br/>**

**Please do not share the private key with anyone, including relatives.<br/>
⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️**

**Feature:**
```
Auto train if
1. Win rate > 70% (U can customize)
2. Reward if win is medium or high (U can customize)
3. Monster's level >= Pet's level - 1
```


**How to start:**

1.  Install nodejs
2.  Open terminal and ```cd {simba_empire_auto_train folder}```
3.  Find server/fight.js

Edit:

```
private key = metamask => Account => Account details => Export private key
```

**Let's go auto train **
```
//0: Low
//1: Medium
//2: High

//Sample: just only fight if reward is high
var fight_reward = [1, 2]; 
```

```
//Just only fight if win percent >= 75%
var min_win_percent = 75;
```

```
var wallet = {
  address: "Your address",
  private_key: "Your private key"
};
```

Config level - Default 7 -> 19 will auto train
```
//Just only fight if pet has level in range 7 -> 19
var begin_pet_level = 7;
var end_pet_level = 19;
```
5.  ```npm install```
6.  ```npm run start:proc```


Result
```
==|===> FIGHT ERROR <===|==
==|===> FINDING MATCH <===|==
[FIGHT] RATE = 72.02821756987625% ==|===> PET XXXXX - PW 80245.378824 vs MONSTER Jungle Ghost - PW 98102 <===|==
==|===> FIGHT DONE <===|==
==|===> FINDING MATCH <===|==
[FIGHT] RATE = 99% ==|===> PET XXXXX - PW 163538.02451 vs MONSTER Jungle Ghost - PW 98102 <===|==
==|===> FIGHT DONE <===|==
==|===> FINDING MATCH <===|==
[FIGHT] RATE = 99% ==|===> PET XXXXX - PW 163538.02451 vs MONSTER Jungle Ghost - PW 98102 <===|==
==|===> FIGHT DONE <===|==
==|===> FINDING MATCH <===|==
```

So ez game!!


```
Donate: 0xECd6fa6cD46F6a04b9A85Bfc86BF2a2ac601eb93 (MATIC)
```
