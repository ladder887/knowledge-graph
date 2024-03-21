import axios from 'axios';
import { forceRadial } from 'd3';

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


const fetchData = async (endpiont, id) => {
    try {
        const response = await axios.get('http://localhost:4000/api/' + endpiont, { params: { ID : id }});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const tweetNodeCreate = async (accountNode) => {
    const tweetdata = await fetchData("data/tweet", accountNode.id);
    //const tweetNodes = [];
    tweetdata.TweetData.forEach(d => {
        let tweetNode = {
            id: d.TweetID,
            group: "Tweet"
        };
        nodes.push(tweetNode);
        let link = {
            source: accountNode,
            target: tweetNode,
            value: 3
        };
        links.push(link);
        dataCount.tweetCount += 1;
        //tweetNodes.push(tweetNode);
    });
    //return tweetNodes;
}

const urlNodeCreate = async (Node, url) => {
    url.forEach(url => {
        let urlNode = {
            id: url,
            group: "URL",
        };
        nodes.push(urlNode);
        let link = {
            source: Node,
            target: urlNode,
            value: 3
        };
        links.push(link);
        dataCount.urlCount += 1;
        //tweetNodes.push(tweetNode);
    });
    //return tweetNodes;
}

export const nodeCreate = async () => {
    try {
        const data = await fetchDataAll();

        for (const d of data) {
            let accountNode = {
                id: d.AccountID,
                group: "Account"
            };

            nodes.push(accountNode);
            dataCount.accountCount += 1;

            const urlNodes = await urlNodeCreate(accountNode, d.AccountDescriptionURL)
            const tweetNodes = await tweetNodeCreate(accountNode);

        }

        console.log(nodes);

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

