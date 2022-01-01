async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function fetchDragonStats(token) {
  try {
    console.log("Getting Stats");
    const response = await fetch(
      `https://api.cryptodragons.com/api-service/v1/dragon/${token}/`
    );
    const data = await response.json();

    const traitData = data.result.genome;

    const averageValuesSum = traitData.reduce((pre, curr) => {
      return pre + curr;
    }, 0);

    const physicalTraitSum = traitData.reduce((pre, curr, index) => {
      return index < 20 ? pre + curr : pre;
    }, 0);

    const arenaScore = traitData.reduce((pre, curr, index) => {
      const geneNumber = index + 1;
      const coefficient = geneNumber >= 20 ? 3 : geneNumber >= 16 ? 2 : 1;
      const geneValue = curr;
      const value = geneValue * coefficient * geneNumber;
      return value + pre;
    }, 0);

    const physicalTraitScore = physicalTraitSum / 20;
    const averageScore = averageValuesSum / 25;

    averageScoreLabel.innerHTML = averageScore;

    arenaScoreLabel.innerHTML = arenaScore;

    physicalTraitScoreLabel.innerHTML = physicalTraitScore;

    dragonImage.src = data.result.imageURL;

    scoreWrapper.classList.remove("hide");

    dragonLink.addEventListener("click", () =>
      createTab(`https://cryptodragons.com/dragon/${token}`)
    );
  } catch (error) {
    console.log(error);
  }
}

async function fetchEggData(token) {
  try {
    console.log("Getting Egg Stats");
    const response = await fetch(
      `https://api.cryptodragons.com/api-service/v1/egg/${token}/`
    );
    const data = await response.json();

    const eggData = data.result;

    eggHatchStatusLabel.innerHTML = eggData.isHatched;
    eggImage.src = eggData.imageURL;
    eggType.innerHTML = eggData.type;

    eggLink.addEventListener("click", () =>
      createTab(`https://cryptodragons.com/egg/${token}`)
    );

    eggDataWrapper.classList.remove("hide");
  } catch (error) {
    console.error(error);
  }
}

function createTab(url) {
  chrome.tabs.create({
    url,
  });
}

async function initialize() {
  const tab = await getCurrentTab();
  const urlArray = tab.url.split("/");
  const defaultToken = urlArray[urlArray.length - 1];
  searchToken.value = defaultToken;
  breedLink.addEventListener("click", () =>
    createTab(
      "https://cryptodragons.com/user/0x8e80aad58f66e30e92142cf6aba17c280f9f5c2f"
    )
  );
  button.addEventListener("click", (e) => {
    searchForm.classList.add("hide");
    e.preventDefault();
    eggDataWrapper.classList.add("hide");
    scoreWrapper.classList.add("hide");
    const formData = new FormData(searchForm);
    const searchType = Number(formData.get("search-type"));
    const searchToken = formData.get("search-token");
    searchType ? fetchDragonStats(searchToken) : fetchEggData(searchToken);
  });
}

const scoreWrapper = document.querySelector("#score-wrapper");
const dragonImage = scoreWrapper.querySelector("#dragon-image");
const dragonType = scoreWrapper.querySelector("#dragon-type");
const averageScoreLabel = scoreWrapper.querySelector("#avrege_score");
const arenaScoreLabel = scoreWrapper.querySelector("#arena_score");
const eggHatchStatusLabel = document.querySelector("#hatched-value");
const eggImage = document.querySelector("#egg-image");
const eggType = document.querySelector("#egg-type");
const physicalTraitScoreLabel = document.querySelector("#physical_trait_score");

const dragonLink = document.querySelector("#dragon-link");
const eggLink = document.querySelector("#egg-link");
const breedLink = document.querySelector("#breed-link");
const eggDataWrapper = document.querySelector("#egg-calculation");
const button = document.querySelector("#trigger");
const searchForm = document.querySelector("#search-form");
const searchToken = document.querySelector("#search-token");

initialize();
