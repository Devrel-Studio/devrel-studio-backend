
class Github {
  // connect to the github api and get history of stars for the repository at the url
  static async collectHistoryForRepo(repoUrl) {
    let url = this.getRepoFromUrl(repoUrl)
    const history = await Github.getHistoryForRepo(url);
    return history
  }

  //get the number of stars for the repo at the url
  static async getStarsForRepo(repo) {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
    const res = await fetch(url, { headers: {
      Authorization: "Bearer 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"} } );
    const data = await res.json();
    console.log("Got response from github")
    console.log(data)
    return data.stargazers_count;
  }

  // remove http://github.com or https://github.com from the url then split it by / and get the owner and repo
  static getRepoFromUrl(url) {
    console.log("Got url" + url)
    url = url.replace("https://github.com/","")
    console.log("New url is " + url + "")
    url = url.replace("http://github.com/","");
    console.log("New url is " + url + "")
    const [owner, repo] = url.split('/');
    console.log("New url is " + url + " and owner is " + owner + " and repo is " + repo + "")
    return { owner, repo };
  }

  //get the number of stars for the repo at the url, then split it by 100 and call the api for each 100
  static async getHistoryForRepo(repo) {
    const history = [];
    const stars = await Github.getStarsForRepo(repo);
    const pages = Math.ceil(stars / 100);
    for (let i = 1; i <= pages; i++) {
      const page = await Github.getStarsForRepoPage(repo, i);
      history.push(...page);
    }
    //create historicaldata with the day and number of stars on each day
    const historicalData = history.reduce((acc, star) => {
      const day = acc.find(day => day.day === star.day);
      if (day) {
        day.stars++;
      } else {
        acc.push({ day: star.day, stars: 1 });
      }
      return acc;
    }, []);

    //map historical data to the format we need - an array with objects
    let newData = historicalData.map(day => ({ day: day.day, stars: day.stars }));
    console.log(newData)
    return newData;
  }

  static async getStarsForRepoPage(repo, i) {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/stargazers?per_page=100&page=${i}`;
    //fetch from url with a custom Accept header
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.star+json',
        Authorization: "Bearer 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"
      }
    });
    //return only day from date in starred_at and the user who starred it

    const data = await res.json();
    return data.map(star => ({ day: star.starred_at.split('T')[0], user: star.user.login }));

  }
}

export default Github;
