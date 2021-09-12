const Web3 = require('web3');
const provider = "https://rpc-mainnet.matic.network";
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


var wallet = {
  address: "Your address",
  private_key: "Your private key"
};

//0: Low
//1: Medium
//2: High

//Sample: just only fight if reward is high
var fight_reward = [2]; // YOU NEED EDIT IT

//Just only fight if win percent >= 75%
var min_win_percent = 75; // YOU NEED EDIT IT

module.exports = {
  async run() {
    var that = this;
    this.fightSchedule();
  },

  async fightSchedule() {
    console.log("==== FIGHT ====");
    var pets = await this.fetchMyPets();
    var monsters = await this.fetchMonsters();
    var that = this;

    var pet_fight, monster_fight, win_percent_fight;

    for (var i = 0; i < pets.length; i++) {
      var pet = pets[i];
      if (!pet.fight_available) continue;
      for (var j = 0; j < monsters.length; j++) {
        var monster = monsters[j];
        var win_percent = that.winPercent(pet, monster);

        const pet_level = parseInt(pet.level);
        const monster_level = parseInt(monster.id);
        if (win_percent >= min_win_percent && monster_level >= pet_level) {
          if (fight_reward.includes(monster.level_reward)) {
            pet_fight = pet;
            monster_fight = monster;
            win_percent_fight = win_percent;
            break;
          } else {
            console.log(`[RW LOW LEVEL, PLS WAIT] RATE = ${win_percent}% ==|====> PET ${pet.id} - PW ${pet.power} vs MONSTER ${monster.name} - PW ${monster.power}`);
          }
        }
      }
    }


    if (pet_fight && monster_fight && win_percent_fight) {
      await that.fight(pet_fight, monster_fight, win_percent_fight);
    }
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
    console.log(`[FIGHT]RATE = ${win_percent}% ==|====> PET ${pet.id} - PW ${pet.power} vs MONSTER ${monster.name} - PW ${monster.power}`);
    await CONTRACT_BATTLE.methods.fight(pet.id, monster.id).call();
  },

  getMonsterMaps(rawData) {
    const totalMaps = Math.ceil(rawData.length / MONSTER_IN_ONE_MAP);

    var that = this;
    if (rawData.length < MONSTER_IN_ONE_MAP) {
      return rawData.filter(e => e.active).map(e => {
        var level_reward = e.fightCount % 300;
        if (level_reward <= 100) level_reward = 0;
        else if (level_reward > 100 && level_reward <= 200) level_reward = 1;
        else level_reward = 2;
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
      if (level_reward <= 100) level_reward = 0;
      else if (level_reward > 100 && level_reward <= 200) level_reward = 1;
      else level_reward = 2;
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
    if (pet.cl == monster.cl) {
      animalPower = animalPower + (animalPower * 0.15);
    } else {
      animalPower = animalPower - (animalPower * 0.15);
    }
    var exp = pet.exp;
    if (animalPower <= 0 || monsterPower < 0) return 0;
    let value = ((animalPower / monsterPower) * 100) + exp * 0.1;
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
