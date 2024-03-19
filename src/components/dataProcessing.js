import axios from 'axios';

let nodes = [], links = [];
let dataCount = {accountCount: 0, urlCount: 0, tweetCount: 0};

const fetchData = async () => {
    try {
        const response = await axios.get('http://localhost:4000/api/data');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const findData = async (endpiont, accountID) => {
    try {
        const response = await axios.get('http://localhost:4000/api/find/' + endpiont, { params: { AccountID: accountID }});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const tweetNodeCreate = async (accountNode) => {
    const tweetdata = await findData("tweet", accountNode.id);
    const tweetNodes = tweetdata.TweetData.map(d => {
        const tweetID = d.TweetID;
        let tweetNode = {
            id: tweetID,
            group: "Tweet",
        };
        let link = {
            source: accountNode,
            target: tweetNode,
            value: 3
        };
        links.push(link);
        dataCount.tweetCount += 1;
        return tweetNode;
    });
    return tweetNodes;
}


export const nodeCreate = async () => {
    try {
        const data = await fetchData();
        for (const d of data) {
            const accountID = d.AccountID
            let accountNode = {
                id: accountID,
                group: "Account",
            };
            nodes.push(accountNode);
            const tweetNodes = await tweetNodeCreate(accountNode);
            nodes.push(...tweetNodes);
            dataCount.accountCount += 1;
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
        let info;
        if (d.group === "Account") {
            const data = await findData("account", d.id);
            //console.log(data)
            info = [
                "Group : " + d.group,
                "AccountID : " + data.AccountID,
                "AccountNickname : " + data.AccountNickname,
                "AccountName : " + data.AccountName,
                "AccountCreated : " + data.AccountCreated,
                "AccountDescription : " + data.AccountDescription,
                "AccountEntities : " + data.AccountEntities,
                "AccountDescriptionHashtag : " + data.AccountDescriptionHashtag,
                "AccountDescriptionURL : " + data.AccountDescriptionURL,
                "AccountDescriptionMention : " + data.AccountDescriptionMention,
                "AccountLocation : " + data.AccountLocation,
                "AccountProfileImageURL : " + data.AccountProfileImageURL,
                "AccountFollowersCount : " + data.AccountFollowersCount,
                "AccountFollowingCount : " + data.AccountFollowingCount,
                "AccountTweetCount : " + data.AccountTweetCount,
                "AccountListedCount : " + data.AccountListedCount,
                "AccountLikeCount : " + data.AccountLikeCount,
                "AccountURL : " + data.AccountURL,
                "AccountVerified : " + data.AccountVerified
            ];
        } else if (d.group === "URL") {
            info = [
                "Group : " + d.group,
                "ID : , " + d.id
            ];
        }
        return info
    } catch (error) {
        console.error(error);
        return null;
    }
};

