import axios from 'axios';


let nodes = [], links = [];
let dataCount = {accountCount: 0, urlCount: 0, tweetCount: 0};

const fetchDataAll = async () => {
    try {
        const response = await axios.get('http://localhost:4000/api/data');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const fetchDataAll_1 = async (currentTime) => {
    try {
        const response = await axios.get('http://localhost:4000/api/data/date', { params: { date : currentTime }});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const fetchData = async (endpiont, id, currentTime) => {
    try {
        const response = await axios.get('http://localhost:4000/api/' + endpiont, { params: { ID : id, date : currentTime }});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const tweetNodeCreate = async (accountNodeId, currentTime) => {
    const tweetdata = await fetchData("data/tweet", accountNodeId, currentTime);
    tweetdata.TweetData.forEach(async d => {
        let tweetNode = {
            id: d.TweetID,
            group: "Tweet"
        };
        nodes.push(tweetNode);
        let link = {
            source: accountNodeId,
            target: d.TweetID,
            valut: 3
        };
        links.push(link);
        dataCount.tweetCount += 1;
        await urlNodeCreate(d.TweetID, d.TweetContentURL)
    });
}

const urlNodeCreate = async (targetNodeId, url) => {
    url.forEach(url => {
        const urlNodeExists = nodes.some(node => node.id === url);
        if (!urlNodeExists) {
            let urlNode = {
                id: url,
                group: "URL",
            };
            nodes.push(urlNode);
            dataCount.urlCount += 1;
        }

        let link = {
            source: targetNodeId,
            target: url,
            value: 3
        };
        links.push(link);
        //tweetNodes.push(tweetNode);
    });
    //return tweetNodes;
}

export const nodeCreate = async (currentTime) => {
    try {
        nodes = [];
        links = [];
        dataCount = {accountCount: 0, urlCount: 0, tweetCount: 0};
        const data = await fetchDataAll_1(currentTime);
        for (const d of data) {
            let accountNode = {
                id: d.AccountID,
                group: "Account"
            };

            nodes.push(accountNode);
            dataCount.accountCount += 1;

            await urlNodeCreate(accountNode.id, d.AccountDescriptionURL)
            await tweetNodeCreate(accountNode.id, currentTime);
        }
        return {
            nodes: nodes,
            links: links,
            dataCount: dataCount
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const nodeInformation = async (d) => {
    try {
        let data;
        if (d.group === "Account") {
            data = await fetchData("find/account", d.id);
        } 
        else if (d.group === "URL") {
            data = {"URL": d.id };
        }
        else if (d.group === "Tweet") {
            //data = {"id": d.id};
            data = await fetchData("find/tweet", d.id);
            data = data.TweetData[0]
            delete data.TweetContentPreprocessing;
            delete data.TweetEntities;
            delete data.TweetContextAnnotations;
        }

        return data
    } catch (error) {
        console.error(error);
        return null;
    }
};

