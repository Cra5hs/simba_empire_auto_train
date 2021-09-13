# simba_empire_auto_train

**⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️ <br/>
If you share the private key with a stranger, you will lose all your money, so you need to keep it carefully. You need to understand the source code to enter the private key. <br/>**

**Please do not share the private key with anyone, including relatives.<br/>
⚠️ ⚠️ ⚠️ WARNING ⚠️ ⚠️ ⚠️**

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
