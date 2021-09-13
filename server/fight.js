/*
 * =============================================================================================
 * ||                                                                                          ||
 * ||                       VOTE + 1 STAR TO THIS REPOSITORY FOR ME THANKS U                   ||
 * ||                                                                                          ||
 * =============================================================================================
 */

const Web3 = require('web3');
const provider = "https://rpc-mainnet.maticvigil.com";
const web3 = new Web3(new Web3.providers.HttpProvider(provider));

const MonsterInfo = require("./monster_info");

const MONSTER_IN_ONE_MAP = 19;

const SIM_DECIMAL = 18;

const ANIMAL_ADDRESS = "0x43bAB1A12dB095641CC8B13c3B23347FA2b3AAa4";
const ANIMAL_ABI = require("./animal_abi.json");
const CONTRACT_ANIMAL = new web3.eth.Contract(ANIMAL_ABI, ANIMAL_ADDRESS);


const BATTLE_ADDRESS = "0x9aA2F05b70386fFe0A273C757fE02C21da021d62";
const BATTLE_ABI = require("./battle_abi.json");
const CONTRACT_BATTLE = new web3.eth.Contract(BATTLE_ABI, BATTLE_ADDRESS);

//if u are developer and u want to debug this source, replace its true value
const DEBUG = false;

//1. Input your address and private key to wallet variable.
var wallet = {
  address: "your address",
  private_key: "your private key "
};

// ======= Winning Rewards =======
// 🔴 Low --- 🟠 Medium --- 🟢 High
//
// Chain: Polygon (Matic)
// Auto Refresh: 5 seconds
//
// 🔴 Bat - 0.056 SIM  (🙍‍♂0)
// 🔴 Boar - 0.106 SIM  (🙍‍♂0)
// 🔴 Golem - 0.222 SIM  (🙍‍♂0)
// 🟢 Dinosaur - 0.607 SIM  (🙍‍♂5)
// 🔴 Ice Golem - 0.98 SIM  (🙍‍♂2)
// 🔴 Orc - 1.73 SIM  (🙍‍♂6)
// 🔴 Skeleton - 5.975 SIM  (🙍‍♂4)
// 🟢 Turtle - 17.578 SIM  (🙍‍♂3)
// 🟠 Witcher - 29.096 SIM  (🙍‍♂6)
// 🟠 Worm - 61.961 SIM  (🙍‍♂7)
// 🔴 Wolf - 79.967 SIM  (🙍‍♂5)
// 🟢 Zombie - 176.741 SIM  (🙍‍♂1)
// 🔴 Ape - 198.374 SIM  (🙍‍♂5)
// 🔴 Jungle Ghost - 466.032 SIM  (🙍‍♂5)
//

// Set reward u want !
//0: Low
//1: Medium
//2: High
//Default: just only fight if reward is high or medium
var fight_rewards = [1, 2];

//Default: Just only fight if win percent >= 70%
var min_win_percent = 70;

//Just only fight if pet level >= 7
var start_pet_level = 7;

module.exports = {
  async run() {
    var that = this;
    this.fightSchedule();
  },

  //fight schedule
  async fightSchedule() {
    try {
      console.log("==|===> FINDING MATCH <===|==");

      //fetch your pets
      var pets = await this.fetchMyPets();
      //fetch monster in maps
      var monsters = await this.fetchMonsters();

      var that = this;
      var pet_fight = null;
      var monster_fight = null;
      var win_percent_fight = null;

      //find and match fight
      for (var i = 0; i < pets.length; i++) {
        var pet = pets[i];
        // check pet level
        if (parseInt(pet.level) < require_pet_level) continue;
        //if pet has fight_count >= 5 => say no!
        if (!pet.fight_available) continue;

        pet_fight = null;
        monster_fight = null;
        win_percent_fight = null;

        //find monsters
        for (var j = 0; j < monsters.length; j++) {
          var monster = monsters[j];
          var win_percent = that.winPercent(pet, monster);
          const pet_level = parseInt(pet.level);
          const monster_level = parseInt(monster.id);

          pet_fight = null;
          monster_fight = null;
          win_percent_fight = null;

          //if win_percent > 75% and monster level >= your pet level => fight
          if (win_percent >= min_win_percent && monster_level >= pet_level - 1) {
            //if reward is low => say no !!
            if (fight_rewards.includes(monster.level_reward)) {
              pet_fight = pet;
              monster_fight = monster;
              win_percent_fight = win_percent;
              break;
            } else {
              console.log(`[RW LOW LEVEL, WAIT NEXT TURN] RATE = ${win_percent}% ==|===> PET ${pet.id} - PW ${pet.power} vs MONSTER ${monster.name} - PW ${monster.power} <===|== ${monster.level_reward}`);
              break;
            }
          }
        }

        //if found monster => break
        if (pet_fight && monster_fight && win_percent_fight) {
          break;
        }
      }

      //if found monster => fight
      if (pet_fight && monster_fight && win_percent_fight) {
        await that.fight(pet_fight, monster_fight, win_percent_fight);
      }

    } catch (err) {
      if (DEBUG) console.log(err);
    }
    var that = this;
    //re-fight after 1s
    setTimeout(function() {
      that.fightSchedule();
    }, 1000);
  },


  async fetchMyPets() {
    var that = this;
    const total = await CONTRACT_ANIMAL.methods.balanceOf(wallet.address).call();
    const json = await CONTRACT_ANIMAL.methods.getSimbasByAccount(wallet.address, total, 0).call();
    var pets = [];
    await this.asyncForEach(json, async e => {
      var price_buy = await that.getPriceBuy(e.level);

      const animalBattle = await CONTRACT_BATTLE.methods.getAdventureSimbas([e.id]).call();
      const simbaFightLimitPerDay = await CONTRACT_BATTLE.methods.simbaFightLimitPerDay().call();

      pets.push({
        id: e.id,
        level: e.level,
        hp: e.hp,
        mp: e.mp,
        st: e.st,
        ag: e.ag,
        it: e.it,
        cl: e.cl,
        power: that.getPower(e, price_buy),
        exp: animalBattle[0].exp,
        fight_count: animalBattle[0].fightCount,
        fight_limit: simbaFightLimitPerDay,
        fight_available: animalBattle[0].fightCount < simbaFightLimitPerDay
      });
    });
    return pets;
  },

  async fetchMonsters() {
    const monsterFightLimitPerDay = await CONTRACT_BATTLE.methods.monsterFightLimitPerDay().call();
    const data = await CONTRACT_BATTLE.methods.getMonsters().call();
    const json = this.getMonsterMaps(data);
    json.sort(function(a, b) {
      return parseInt(b.id) - parseInt(a.id);
    });
    return json;
  },

  async fight(pet, monster, win_percent) {
    try {
      console.log(`[FIGHT] RATE = ${win_percent}% ==|===> PET ${pet.id} - PW ${pet.power} vs MONSTER ${monster.name} - PW ${monster.power} <===|==`);
      var transaction = CONTRACT_BATTLE.methods.fight(pet.id, monster.id);
      var estimateGas = await transaction.estimateGas({
        from: wallet.address
      });
      var gasPrice = await web3.eth.getGasPrice();
      gasPrice = gasPrice * 20;
      const options = {
        to: BATTLE_ADDRESS,
        data: transaction.encodeABI(),
        gas: estimateGas,
        gasPrice: gasPrice
      };
      const signed = await web3.eth.accounts.signTransaction(options, wallet.private_key);
      const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
      if (receipt) {
        console.log(`==|===> FIGHT DONE <===|==`);
      } else {
        console.log(`==|===> FIGHT ERROR <===|==`);
      }
    } catch (err) {
      if (DEBUG) console.log(err);
      console.log(`==|===> FIGHT ERROR <===|==`);
    }
  },

  getMonsterMaps(rawData) {
    const totalMaps = Math.ceil(rawData.length / MONSTER_IN_ONE_MAP);

    var that = this;
    if (rawData.length < MONSTER_IN_ONE_MAP) {
      return rawData.filter(e => e.active).map(e => {
        var level_reward = e.fightCount % 300;
        if (e.fightCount == 0) level_reward = 2; // HIGH
        if (level_reward <= 100) level_reward = 2; // HIGH
        else if (level_reward > 100 && level_reward <= 200) level_reward = 1; //MEDIUM
        else level_reward = 0; //LOW
        return {
          id: e.id,
          cl: e.cl,
          power: that.cryptoConvert('decode', e.power, 18),
          active: e.active,
          fight_count: e.fightCount,
          level_reward: level_reward,
          name: MonsterInfo[parseInt(e.id)].name
        };
      });
    }

    let i, j, monsterRaw = [],
      maps = [];
    for (i = 0, j = rawData.length; i < j; i += MONSTER_IN_ONE_MAP) {
      const array = rawData.slice(i, i + MONSTER_IN_ONE_MAP);
      maps.push(array);
    }

    let currentMap = DateTimeUtils.getRangeHour(new Date().getHours(), 7, 4);

    if (maps[currentMap - 1]) monsterRaws = maps[currentMap - 1];

    else {
      currentMap = 1;
      monsterRaws = maps[0];
    }


    return monsterRaws.filter(e => e.active).map(e => {
      var level_reward = e.fightCount % 300;
      if (e.fightCount == 0) level_reward = 2; // HIGH
      if (level_reward <= 100) level_reward = 2; // HIGH
      else if (level_reward > 100 && level_reward <= 200) level_reward = 1; //MEDIUM
      else level_reward = 0; //LOW
      return {
        id: e.id,
        cl: e.cl,
        power: that.cryptoConvert('decode', e.power, 18),
        active: e.active,
        fight_count: e.fightCount,
        level_reward: level_reward,
        name: MonsterInfo[parseInt(e.id)].name
      };
    });
  },

  cryptoConvert(type, amount, decimals, ) {
    if (type === 'decode') {
      return (amount) / +("1" + new Array(+decimals).fill(0).toString().replace(/,/g, ''));
    }
    const scale = +decimals - (amount.toString().split('.')[1].length || 0);
    let output = amount.toString();
    for (let i = 0; i < scale; i++) output += '0';
    output = output.replace('.', '');
    if (output[0] === "0") output = output.slice(1, output.length)
    return output;
  },

  winPercent(pet, monster) {
    var animalPower = pet.power;
    var monsterPower = monster.power;
    if (pet.cl == monster.cl) { //if pet & monster same color, increase power of your pet
      animalPower = animalPower + (animalPower * 0.15);
    } else { //else deincrease
      animalPower = animalPower - (animalPower * 0.15);
    }
    var exp = pet.exp;
    if (animalPower <= 0 || monsterPower < 0) return 0;
    let value = ((animalPower / monsterPower) * 100) + exp * 0.1; //1 exp will increase 0.1% win rate
    if (value > 99) return 99;
    return value;
  },

  async getPriceBuy(level) {
    const data = await CONTRACT_ANIMAL.methods.SIMBA_PRICES(level).call();
    var result = +this.cryptoConvert('decode', data, SIM_DECIMAL);
    return result;
  },

  getPower(json, priceBuy) {
    const totalQualities = +json.ag + +json.hp + +json.it + +json.st + +json.mp;
    const value = parseFloat(priceBuy + (priceBuy * totalQualities) / 714);
    return +(value.toFixed(6));
  },

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  },
}
