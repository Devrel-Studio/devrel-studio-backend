
class Github {
  // connect to the github api and get history of stars for the repository at the url
  static async collectIssuesFor(repoUrl) {
    let url = this.getRepoFromUrl(repoUrl)
    let issues = await this.issuesForRepo(url)
    //create a list of days from the start of the project to today with the number of open issues for each day
    let opened = [];
    let closed = [];
    issues.forEach((issue) => {
      if(issue.state==="open") {
        let day = issue.created_at.split("T")[0];
        let index = opened.findIndex((item) => item.day === day);
        if (index === -1) {
          opened.push({ day: day, issues: 1 });
        } else {
          opened[index].issues++;
        }

      }else{
        let day = issue.created_at.split("T")[0];
        let index = closed.findIndex((item) => item.day === day);
        if (index === -1) {
          closed.push({ day: day, issues: 1 });
        } else {
          closed[index].issues++;
        }

      }

    } );
    return {
      open: opened,
      closed: closed
    };
  }

  //get all issues for a github repository
  static async issuesForRepo(repo) {
    //get the number of issues
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/issues?state=all`;
    const res = await fetch(url, { headers: {
        Authorization: "Bearer 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"} } );
    const data = await res.json();
    console.log("Got response from issues")
    console.log(data)
    return data;
  }

  static async collectHistoryFor(repoUrl) {
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
    url = url.replace("https://github.com/","")
    url = url.replace("http://github.com/","");
    const [owner, repo] = url.split('/');
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
