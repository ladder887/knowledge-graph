import axios from 'axios';

export const fetchData = async () => {
    try {
        const response = await axios.get('http://localhost:4000/api/data');
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const findData = async (AccountID) => {
    try {
        const response = await axios.get('http://localhost:4000/api/find/account', { params: { AccountID: AccountID }});
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const dataParser = async (d) => {
    try {
        var info;
        if (d.group === "Account") {
            var data = await findData(d.id);
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

export const processData = async () => {
    try {
        const data = await fetchData();
        var nodes = [], links = [];
        var urlConnections = {};
        var accountNodes = {};
        var accountCount = 0;
        var urlCount = 0;

        data.forEach(d => {
            const accountID = d.AccountID
            var accountNode = {
                id: accountID,
                group: "Account",
            };
            accountCount += 1
            nodes.push(accountNode);
        });
        //console.log(nodes)

        return {
            nodes: nodes,
            links: links
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};