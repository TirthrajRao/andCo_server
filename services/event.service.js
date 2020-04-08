// Npm modules
const async = require("async");
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const _ = require("lodash");
const CryptoJS = require("crypto-js");
const key = 'andCo@testing'

// Database models 
const EventModel = require('../models/event.model');
const GroupModel = require('../models/group.model');
const CartModel = require('../models/cart.model');
const UserModel = require('../models/user.model');
const TransactionModel = require('../models/transaction.model');

// Static variables
const config = require("../configNew");

// Services
const mailService = require('../services/mail.service');

/**
* Create New Event Function
* @param {object} body - Event data to Create New Event
* @returns {Promise} - New Event or reason why failed
*/
module.exports.createNewEvent = (eventData) => {
    console.log("event data ", eventData)
    return new Promise((resolve, reject) => {
        fnHashtagAvailable(eventData.hashTag).then((response) => {
            if (response) {
                EventModel.create(eventData, (eventError, newEvent) => {
                    if (eventError) {
                        console.log('Event Error:', eventError);
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        console.log("new event created", newEvent)
                        fnGenerateEventLink(newEvent).then((Response) => {
                            resolve({ status: 201, message: 'Yayy! Your new event is created.', data: Response.data });
                        }).catch((error) => {
                            console.log("error while generate link", error)
                            reject({ status: 500, message: 'Internal Server Error' });
                        });
                    }
                });
            } else {
                reject({ status: 500, message: 'Hashtag Already Exists.' })
            }
        }).catch((error) => {
            console.log("final error", error)
            reject({ status: 500, message: 'Internal Server Error' })
        });
    });
}

/**
 * Function For Check Hashtag Availability
 * @param {string} hashTag 
 */
function fnHashtagAvailable(hashTag) {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ hashTag: hashTag }, (error, event) => {
            if (error) {
                console.log("Internal Server Error");
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (!event) {
                console.log('HashTag Is Available');
                resolve(true)
            } else {
                console.log('HashTag Is Not Available');
                resolve(false)
            }
        });
    });
}

/**
 * Function For Generate Event Link For Event
 * @param {object} event 
 */
function fnGenerateEventLink(event) {
    console.log("call thay che ke nai", event)
    return new Promise((resolve, reject) => {
        // const param = String(event._id);
        // const baseParam = CryptoJS.AES.encrypt(JSON.stringify(param), key).toString();
        // console.log("base param", baseParam)
        // const baseParam = Buffer.from(param).toString('base64');
        const link = config.baseUrl + config.welcomeGuest + event.hashTag;
        console.log("new link with crypto js", link)
        const eventLink = { eventLink: link }
        EventModel.findByIdAndUpdate({ _id: event._id }, eventLink, { upsert: true, new: true }, (eventError, updatedEvent) => {
            if (eventError) {
                console.log('usererror: ', eventError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Event Created Successfully.', data: updatedEvent });
            }
        });
    });
}

/**
 * Update a Event Inside Specific Activity
 * @param {object} body - Event data to update
 * @returns {Promise} - updated Event or reason why failed
 */
module.exports.updateExistingEvent = (eventId, eventData) => {
    return new Promise((resolve, reject) => {
        fnHashtagAvailableOnUpdate(eventId, eventData.hashTag).then((response) => {
            if (response) {
                EventModel.findByIdAndUpdate({ _id: eventId }, eventData, { upsert: true, new: true }, (eventError, updatedEvent) => {
                    if (eventError) {
                        console.log('usererror: ', eventError);
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        console.log("update event details", updatedEvent)
                        fnGenerateEventLink(updatedEvent).then((linkUpdate) => {
                            console.log("link update completed", linkUpdate)
                            resolve({ status: 200, message: 'Event Updated Successfully.', data: updatedEvent });
                        }).catch((error) => {
                            reject({ status: 500, message: 'Error while update event link' })
                            console.log("error while update link", error)
                        })
                    }
                });
            } else {
                reject({ status: 500, message: 'Hashtag Not Available.' });
            }
        }).catch((error) => {
            reject({ status: 500, message: 'Internal Server Error' });
        });
    });
}

/**
 * Function For Check Hashtag Availability On Update Event
 * @param {string} eventId 
 * @param {string} hashTag 
 * @returns {Promise} available Or Not or reason why failed
 */
function fnHashtagAvailableOnUpdate(eventId, hashTag) {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ _id: eventId }, (error, event) => {
            if (error) {
                console.log("Internal Server Error", error);
                resolve(false);
            } else if (event.hashTag == hashTag) {
                resolve(true);
            } else {
                EventModel.findOne({ hashTag: hashTag }, (error, event) => {
                    if (!event) {
                        resolve(true)
                    } else if (error) {
                        console.log("Internal Server Error", error);
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        resolve(false)
                    }
                });
            }
        });
    });
}

/**
 * Create New Activity Inside Event Function
 * @param {object} body - Activity data to Create New Activity Inside Event
 * @returns {Promise} - New Activity or reason why failed
 */
module.exports.newActivityInsideEvent = (activityData) => {
    console.log("details of list of activities", activityData)
    // activityData.forEach(singleDate, =>{
    //     console.log
    // })
    const eventId = activityData[0].eventId;
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: eventId }, { $push: { activities: activityData } }, { new: true }, (activityError, newActivity) => {
            if (activityError) {
                console.log('Activity Error: ', activityError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log("activity added in event", newActivity)
                resolve({ status: 200, message: 'New Activities Created', data: newActivity.activities });
            }
        });
    });
}

/**
 * Create New Group Inside Activity
 * @param {object} body - Group data to Create New Group Inside Activity
 * @returns {Promise} - New Group or reason why failed
 */
module.exports.newGroupInsideActivity = (groupData, eventId) => {

    console.log('New Group data', groupData);

    return new Promise((resolve, reject) => {

        async.eachSeries(groupData, (singleGroup, callback) => {
            console.log("single activity with group details======", singleGroup)
            let newGroup = {
                eventId: eventId,
                activityId: singleGroup.activityId,
                groupName: singleGroup.groupName,
                item: [],
            }
            _.forEach(singleGroup.male, (maleArray) => {
                maleArray.itemGender = 'male';
                newGroup.item.push(maleArray);
            })

            _.forEach(singleGroup.female, (femaleArray) => {
                femaleArray.itemGender = 'female';
                newGroup.item.push(femaleArray);
            })

            GroupModel.create(newGroup, (groupError, groupRes) => {
                if (groupError) {
                    console.log('callbackError: ', groupError);
                    reject({ status: 500, message: 'Internal Server Error' });
                } else {
                    callback();
                }
            });
        }, (callbackError, callbackResponse) => {
            if (callbackError) {
                console.log('callbackError: ', callbackError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'New Group Created Successfully.' });
            }
        });
    });
}

/**
 * Update a Group Inside Specific Activity
 * @param {object} body - group data to update
 * @returns {Promise} - updated group or reason why failed
 */
module.exports.updateGroupInsideActivity = (groupData) => {
    console.log("group data", groupData)
    return new Promise((resolve, reject) => {
        async.eachSeries(groupData, (singleGroup, parentcb) => {
            console.log("single group details", singleGroup)
            if (singleGroup.groupId) {
                console.log("call first if condition or not")
                async.parallel({
                    group: function (cb) {
                        GroupModel.findByIdAndUpdate({ _id: singleGroup.groupId }, { $set: { groupName: singleGroup.groupName } }).exec((error, updateGroup) => {
                            if (error) {
                                console.log('Internal Server Error');
                            } else {
                                console.log("call this or not", updateGroup)
                                cb();
                            }
                        });
                    },
                    male: function (cb) {
                        console.log("cb =========", cb)
                        async.eachSeries(singleGroup.male, (maleData, callback) => {
                            console.log("male data", maleData)
                            if (maleData.itemId) {
                                const newValues = { $set: { 'item.$.itemName': maleData.itemName, 'item.$.itemPrice': maleData.itemPrice, 'item.$.itemGender': 'male' } }
                                GroupModel.updateOne({ _id: singleGroup.groupId, 'item._id': ObjectId(maleData.itemId) }, newValues)
                                    .exec((error, response) => {
                                        if (error) {
                                            console.log('Internal Server Error');
                                        } else {
                                            console.log("response of new male items", response)
                                            callback();
                                        }
                                    });
                            } else {
                                console.log("first male check")
                                const maleItem = { itemName: maleData.itemName, itemPrice: maleData.itemPrice, itemGender: 'male', }
                                GroupModel.updateOne({ _id: singleGroup.groupId }, { $push: { item: maleItem } }, { new: true, upsert: true }).exec((error, response) => {
                                    if (error) {
                                        console.log('Internal Server Error');
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        }, (callbackError, callbackResponse) => {
                            if (callbackError) {
                                console.log('Internal Server Error');
                            } else {
                                cb();
                            }
                        });

                    },
                    female: function (cb) {

                        async.eachSeries(singleGroup.female, (femaleData, callback) => {
                            if (femaleData.itemId) {
                                const newValues = { $set: { 'item.$.itemName': femaleData.itemName, 'item.$.itemPrice': femaleData.itemPrice, 'item.$.itemGender': 'female' } }
                                GroupModel.updateOne({ _id: singleGroup.groupId, 'item._id': ObjectId(femaleData.itemId) }, newValues)
                                    .exec((error, response) => {
                                        if (error) {
                                            console.log('Internal Server Error');
                                        } else {
                                            callback();
                                        }
                                    });
                            } else {
                                const femaleItem = { itemName: femaleData.itemName, itemPrice: femaleData.itemPrice, itemGender: 'female', }
                                GroupModel.updateOne({ _id: singleGroup.groupId }, { $push: { item: femaleItem } }, { new: true, upsert: true }).exec((error, response) => {
                                    if (error) {
                                        console.log('Internal Server Error');
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        }, (callbackError, callbackResponse) => {
                            if (callbackError) {
                                console.log('Internal Server Error');
                            } else {
                                cb();
                            }
                        });

                    }
                }, function (callbackError, callbackResponse) {
                    if (callbackError) {
                        console.log('Final cb Error');
                    } else {
                        parentcb();
                    }
                });
            }
            else {
                console.log("call this else part")
                const newGroup = {
                    eventId: groupData.eventId,
                    activityId: singleGroup.activityId,
                    groupName: singleGroup.groupName,
                    item: [],
                }

                _.forEach(singleGroup.male, (maleArray) => {
                    maleArray.itemGender = 'male';
                    newGroup.item.push(maleArray);
                })

                _.forEach(singleGroup.female, (femaleArray) => {
                    femaleArray.itemGender = 'female';
                    newGroup.item.push(femaleArray);
                })

                GroupModel.create(newGroup, (groupError, groupRes) => {
                    if (groupError) {
                        console.log('Internal Server Error');
                    } else {
                        parentcb();
                    }
                });
            }
        }, (callbackError, callbackResponse) => {
            if (callbackError) {
                console.log('callbackError: ', callbackError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Groups Updated Successfully.' });
            }
        });
    });
}

/**
 * Function For Whole Event Detail Using eventId
 * @param {eventId} - EventId for Delete Event
 * @returns {Promise} - Event Detail or reason why failed
 */
const eventDetail = (eventId, userId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            //Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            //Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    userId: '$userId',
                    startDate: '$startDate',
                    endDate: '$endDate',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    eventLink: '$eventLink',
                    eventTheme: '$eventTheme',
                    defaultImage: '$defaultImage',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    activities: '$activities',
                    afterEventMessage: '$afterEventMessageDetails',
                    invitationMessage: '$invitationMessage',
                    reminderDetails: '$reminderDetails',
                    welcomeMessage: '$welcomeMessage'
                }
            },
            {
                $unwind: {
                    path: '$activities',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: { activityId: '$activities._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$activityId', '$activityId'] },
                                        { $eq: ['$isDeleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activities.group'
                }
            },
            // Make Group Of Final Multiple Data to Single Object
            {
                $group: {
                    _id: '$_id',
                    hashTag: {
                        $first: '$hashTag',
                    },
                    eventType: {
                        $first: '$eventType',
                    },
                    eventTitle: {
                        $first: '$eventTitle',
                    },
                    isPublic: {
                        $first: '$isPublic',
                    },
                    userId: {
                        $first: '$userId',
                    },
                    startDate: {
                        $first: '$startDate',
                    },
                    endDate: {
                        $first: '$endDate',
                    },
                    profilePhoto: {
                        $first: '$profilePhoto'
                    },
                    paymentDeadlineDate: {
                        $first: '$paymentDeadlineDate',
                    },
                    eventLink: {
                        $first: '$eventLink',
                    },
                    eventTheme: {
                        $first: '$eventTheme',
                    },
                    defaultImage: {
                        $first: '$defaultImage'
                    },
                    afterEventMessage: {
                        $first: '$afterEventMessage'
                    },
                    invitationMessage: {
                        $first: '$invitationMessage'
                    },
                    reminderDetails: {
                        $first: '$reminderDetails'
                    },
                    welcomeMessage: {
                        $first: '$welcomeMessage'
                    },
                    activity: {
                        $push: '$activities',
                    },
                }
            },
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventDetailError });
            } else {
                fnCheckForCelebrant(eventId, userId).then((response) => {
                    eventDetail[0].isCelebrant = response;
                    fnCheckForGuestJoined(eventId, userId).then((response) => {
                        console.log("response of check event", response)
                        let todayDate = new Date
                        let paymentDeadlineDate = Date.parse(eventDetail[0].paymentDeadlineDate)
                        // console.log("today date is sure or not", guestEvent[0])
                        if (todayDate > paymentDeadlineDate) {
                            console.log("payment is closed")
                            eventDetail[0].isClosed = true
                        } else {
                            console.log("payment is open")
                            eventDetail[0].isClosed = false
                        }
                        eventDetail[0].isJoined = response;
                        resolve({ status: 200, message: 'Event Detail fetch Successfully!', data: eventDetail[0] });
                    }).catch((error) => {
                        reject({ status: 500, message: 'Internal Server Error', data: eventDetailError });
                    });
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                });
            }
        });
    });
}

const onlyEventDetail = (eventId) => {
    console.log('EventId:', eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            //Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            //Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    userId: '$userId',
                    startDate: '$startDate',
                    endDate: '$endDate',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    eventLink: '$eventLink',
                    eventTheme: '$eventTheme',
                    defaultImage: '$defaultImage',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                }
            },
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventDetailError });
            } else {
                resolve(eventDetail[0]);
            }
        });
    });
}



/**
 * @param {eventId} - EventId for activity details
 * get activity details
 */
function activityDetailsOfEvent(eventId, userId) {
    return new Promise((resolve, reject) => {
        EventModel.findById({ _id: eventId })
            // .populate('activities')
            .exec((error, activityDetails) => {
                if (error)
                    // console.log("error while get activity details", error)
                    reject({ status: 500, message: 'Error while get details of activity' })
                else {
                    console.log("details of activity", activityDetails.activities)
                    let data = activityDetails.activities
                    if (data.length > 0) {
                        resolve(data)
                    } else {
                        resolve({ message: 'This is create new event' })
                    }
                }
            })
    })
}

/**
 * Function For checking User Is Creator Of Particular event
 * @param {string} eventId 
 * @param {string} userId 
 */
function fnCheckForCelebrant(eventId, userId) {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ _id: eventId, userId: userId }, (eventError, event) => {
            if (eventError) {
                console.log('Event Error:', eventError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (!event) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Function For Checking User Is Joined Particular event
 * @param {string} eventId 
 * @param {string} userId 
 */
function fnCheckForGuestJoined(eventId, userId) {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ _id: eventId, 'guest._id': userId }, (eventError, event) => {
            console.log("event is false or not", event)
            if (eventError) {
                console.log('Event Error:', eventError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (!event) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * @param {EventHashTag} hashTag 
 * @param {Login userId} userId 
 * Get event details when click on link with use of hashtag
 */
function guestEventDetail(hashTag, userId) {
    console.log("event hash tag for guest", hashTag)
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            {
                $match: {
                    'hashTag': hashTag
                }
            },

            //Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    userId: '$userId',
                    startDate: '$startDate',
                    endDate: '$endDate',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    eventLink: '$eventLink',
                    eventTheme: '$eventTheme',
                    defaultImage: '$defaultImage',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    activities: '$activities',
                    welcomeMessage: '$welcomeMessage'
                }
            },
            {
                $unwind: {
                    path: '$activities',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: { activityId: '$activities._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$activityId', '$activityId'] },
                                        { $eq: ['$isDeleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activities.group'
                }
            },
            // Make Group Of Final Multiple Data to Single Object
            {
                $group: {
                    _id: '$_id',
                    hashTag: {
                        $first: '$hashTag',
                    },
                    eventType: {
                        $first: '$eventType',
                    },
                    eventTitle: {
                        $first: '$eventTitle',
                    },
                    isPublic: {
                        $first: '$isPublic',
                    },
                    userId: {
                        $first: '$userId',
                    },
                    startDate: {
                        $first: '$startDate',
                    },
                    endDate: {
                        $first: '$endDate',
                    },
                    profilePhoto: {
                        $first: '$profilePhoto'
                    },
                    paymentDeadlineDate: {
                        $first: '$paymentDeadlineDate',
                    },
                    eventLink: {
                        $first: '$eventLink',
                    },
                    eventTheme: {
                        $first: '$eventTheme',
                    },
                    defaultImage: {
                        $first: '$defaultImage'
                    },
                    welcomeMessage: {
                        $first: '$welcomeMessage'
                    },
                    activity: {
                        $push: '$activities',
                    },
                }
            },
        ]).exec((error, guestEvent) => {
            if (error)
                console.log("error while get details of guest", error)
            else {
                // console.log("guest event details use of hashtag", guestEvent)
                fnCheckForCelebrant(guestEvent[0]._id, userId).then((response) => {
                    guestEvent[0].isCelebrant = response;
                    fnCheckForGuestJoined(guestEvent[0]._id, userId).then((response) => {
                        let todayDate = new Date
                        let paymentDeadlineDate = Date.parse(guestEvent[0].paymentDeadlineDate)
                        console.log("today date is sure or not", guestEvent[0])
                        if (todayDate > paymentDeadlineDate) {
                            console.log("payment is closed")
                            guestEvent[0].isClosed = true
                        } else {
                            console.log("payment is open")
                            guestEvent[0].isClosed = false
                        }
                        guestEvent[0].isJoined = response;
                        resolve({ status: 200, message: 'Event Detail fetch Successfully!', data: guestEvent[0] });
                    }).catch((error) => {
                        console.log("error while where guest is join the event or not", error)
                        // reject({ status: 500, message: 'Internal Server Error', data: eventDetailError });
                    });
                }).catch((error) => {
                    console.log("error while check is celebrant", error)
                    // reject({ status: 500, message: 'Internal Server Error' });
                });
            }
        })
    })
}




/**
 * Function For Remove Group From Activity Using GroupId
 * @param {GroupId} - GroupId for Delete Particular Group
 * @returns {Promise} - Deleted Group or reason why failed
 */
module.exports.deleteGroupFromActivity = (GroupId) => {
    console.log('GroupId:', GroupId);
    return new Promise((resolve, reject) => {
        GroupModel.findByIdAndRemove({ _id: GroupId }, {}, (groupError, group) => {
            if (groupError) {
                console.log("Delete Group Error:", groupError);
                reject({ status: 500, message: 'Internal Server Error' });
            }
            else {
                resolve({ status: 200, message: 'Group Deleted Successfully.' });
            }
        });
    });
}

/**
 * Remove Item From Particular Group
 * @param {String} GroupId 
 * @param {String} ItemId 
 */
const deleteItemFromGroup = (GroupId, ItemId) => {
    console.log('groupId and ItemId', GroupId, ItemId);
    return new Promise((resolve, reject) => {
        GroupModel.update({ _id: GroupId }, { $pull: { item: { _id: ItemId } } }, (groupErr, group) => {
            if (groupErr) {
                console.log("Delete Item From Group:", groupErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Item Deleted Successfully.', data: group });
            }
        });
    });
}



/**
 * Function For Remove Activity From Event Using ActivityId
 * @param {activity} - EventId for Delete Event
 * @returns {Promise} - Deleted Event or reason why failed
 */
module.exports.deleteActivityFromEvent = (eventId, activityId) => {
    console.log('EventID and', eventId, activityId);
    return new Promise((resolve, reject) => {
        EventModel.update({ _id: eventId }, { $pull: { activities: { _id: activityId } } }, (activityError, activity) => {
            if (activityError) {
                console.log("Delete Activity Error:", activityError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                onlyActivityList(eventId).then((response) => {
                    console.log('Response From:', response);
                    resolve({ status: 200, message: 'Activity Deleted Successfully.', data: response.data });
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    });
}

/**
 * Function For Only Activities Array Using EventId
 * @param {String} eventId 
 */
const onlyActivityList = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            // Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            // Reduce To Limited Data Using Project
            {
                $project: {
                    activities: '$activities'
                }
            },
        ]).exec(function (activitiesErr, activitiesList) {
            if (activitiesErr) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log('activitiesList:', activitiesList);
                resolve({ status: 200, message: 'Activity List Fetch Successfully.', data: activitiesList[0] });
            }
        });
    });
}


/**
 * Function For Remove Event Using EventId
 * @param {eventId} - EventId for Delete Event
 * @returns {Promise} - Deleted Event or reason why failed
 */
module.exports.deleteEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('EventId In Delete Event:', eventId);
        EventModel.findOneAndRemove({ _id: eventId }, { $set: { isDeleted: true } }, (activityError, event) => {
            if (activityError) {
                console.log("Delete Activity Error:", activityError);
                reject({ status: 500, message: 'Internal Server Error' });
            }
            else {
                removeAllGroupUsingEventId(eventId).then((response) => {
                    removeAllTransactionUsingEventId(eventId).then((response) => {
                        resolve({ status: 200, message: 'Event Deleted Successfully.' });
                    }).catch((err) => {
                        reject({ status: 500, message: 'Internal Server Error' });
                    })
                }).catch((err) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    });
}

// Remove all Group Using EventId

const removeAllGroupUsingEventId = (eventId) => {
    console.log('EventId In Delete Group:', eventId);
    return new Promise((resolve, reject) => {
        GroupModel.deleteMany({ eventId: eventId }, (groupErr, groupRes) => {
            if (groupErr) {
                console.log('Group Delete Error: ', groupErr);
                reject(groupErr);
            } else {
                resolve(groupRes);
            }
        });
    });
}
// Remove all Transaction Using EventId

const removeAllTransactionUsingEventId = (eventId) => {
    console.log('EventId In Delete Transaction:', eventId);
    return new Promise((resolve, reject) => {
        TransactionModel.deleteMany({ eventId: eventId }, (TransactionErr, TransactionRes) => {
            if (TransactionErr) {
                console.log('Transaction Delete Error: ', TransactionErr);
                reject(TransactionErr);
            } else {
                resolve(TransactionRes);
            }
        });
    });
}

/**
 * Customize Thanks Message For After Payment Message
 * @param {object} body - message data to add new message
 * @returns {Promise} - New Message or reason why failed
 */
module.exports.thanksMessageDetail = (messageData) => {
    const newmessage = { thanksMessage: { attachment: messageData.attachment, message: messageData.message } }
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: messageData.eventId }, newmessage, (messageError, newMessage) => {
            if (messageError) {
                console.log('Message Creation Error: ', messageError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'New Thanks Message Created Successfully.' });
            }
        });
    });
}

/**
 *event list of all public event for homepage display
 * @returns {Promise} - All Public Event List or reason why failed
 */
module.exports.eventList = () => {
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    eventTheme: '$eventTheme',
                    defaultImage: '$defaultImage',
                    isPaymentAccept:
                    {
                        $cond: { if: { $lt: ["$paymentDeadlineDate", new Date()] }, then: false, else: true }
                    }
                }
            },
        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject(eventListError);
            } else {
                resolve({ status: 200, message: 'Event List!', data: eventList });
            }
        });
    });
}

/**
 * Update a Activity Inside Specific Event
 * @param {object} body - Activity data to update
 * @returns {Promise} - updated Activity or reason why failed
 */
module.exports.updateActivityInsideEvent = (activityData) => {
    return new Promise((resolve, reject) => {
        const eventId = activityData[0].eventId;
        async.eachSeries(activityData, (singleActivity, callback) => {
            if (singleActivity.activityId) {
                EventModel.updateOne({ _id: singleActivity.eventId, 'activities._id': ObjectId(singleActivity.activityId) }, { $set: { 'activities.$.activityStartDate': singleActivity.activityStartDate, 'activities.$.activityEndDate': singleActivity.activityEndDate, 'activities.$.activityName': singleActivity.activityName, 'activities.$.activityDate': singleActivity.activityDate } })
                    .exec((error, response) => {
                        if (error) {
                            reject({ status: 500, message: 'Internal Server Error' });
                        } else {
                            callback();
                        }
                    });
            } else {
                const activityData = {
                    activityName: singleActivity.activityName,
                    eventId: singleActivity.eventId,
                    activityStartDate: singleActivity.activityStartDate,
                    activityEndDate: singleActivity.activityEndDate
                }
                EventModel.findByIdAndUpdate({ _id: singleActivity.eventId }, { $push: { activities: activityData } }, { new: true }, (activityError, newActivity) => {
                    if (activityError) {
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        callback();
                    }
                });
            }
        }, (callbackError, callbackResponse) => {
            if (callbackError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                eventDetail(eventId).then((response) => {
                    resolve({ status: 200, message: 'Activities Updated Successfully.', data: response.data });
                }).catch((err) => {
                    console.log('Error', err);
                })
            }
        });
    });
}

/**
 * Event List By Particular User
 * @param {userId} - UserId as a Param
 * @returns {Promise} - My Event List or reason why failed
 */

module.exports.MyEventList = (userId) => {
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            //Match Event Using UserId
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { 'userId': ObjectId(userId) },
                                { 'isDeleted': false },
                            ]
                        },
                        {
                            $and: [
                                { 'guest._id': ObjectId(userId) },
                                { 'isDeleted': false },
                            ]
                        },
                    ]
                }
            },
            { $sort: { 'createdAt': 1, } },
            //Project For Limit the Data From Model
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    profilePhoto: '$profilePhoto',
                    eventTheme: '$eventTheme',
                    eventLink: '$eventLink',
                    defaultImage: '$defaultImage'
                }
            },
        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'MyEvent List!', data: eventList });
            }
        });
    });
}

const MyEventListTotalTransaction = (userId) => {
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            {
                $match: { 'userId': ObjectId(userId) },
            },
            {
                $project: {
                    _id: 0,
                    eventId: '$_id',
                    userId: '$userId'
                }
            },
            {
                $group: {
                    _id: '$userId',
                    eventArray: {
                        $push: '$eventId'
                    }
                }
            }
        ]).exec(function (collectionErr, collectionRes) {
            if (collectionErr) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                var grandCollection = 0;
                if (collectionRes == '') {
                    resolve({ status: 200, message: 'My Collection!', data: grandCollection });
                } else {
                    _.forEach(collectionRes[0].eventArray, (singleEvent) => {
                        TransactionUsingEventId(singleEvent).then((response) => {
                            if (response == '') {
                                grandCollection = 0;
                            } else {
                                grandCollection = grandCollection + response.TransactionTotal;
                            }
                            resolve({ status: 200, message: 'My Collection!', data: grandCollection });
                        }).catch((err) => {
                            reject({ status: 500, message: 'Internal Server Error' });
                        })
                    });
                }
            }
        });
    });
}

const TransactionUsingEventId = (eventId) => {
    return new Promise((resolve, reject) => {
        TransactionModel.aggregate([
            {
                $match: { 'eventId': ObjectId(eventId) },
            },
            {
                $group: {
                    _id: '$eventId',
                    TransactionTotal: {
                        $sum: '$finalTotal'
                    }
                }
            }
        ]).exec(function (collectionErr, collectionRes) {
            if (collectionErr) {
                reject(collectionErr);
            } else {

                resolve(collectionRes[0]);
            }
        });
    });
}



/**
* Create New Cart Item Function
* @param {object} body - Event data to Create New Event
* @returns {Promise} - New Item or reason why failed
*/
module.exports.addItemToCart = (itemData, hashTag, userId) => {
    console.log("Item Data ========", hashTag);
    return new Promise((resolve, reject) => {
        findEventIdWithHashtag(hashTag.eventHashtag).then((response) => {
            console.log("find event id of hashtag", response)
            itemsAddedInCart(response._id, itemData, userId).then((response) => {
                console.log("all items added", response)
                // cartItemList(response.data.eventDetail._id, userId).then((cartTotalItem) => {
                //     console.log("total items of cart after added", cartTotalItem)
                // }).catch((error) => {
                //     console.log("error while get cart item", error)
                // })
                resolve({ data: response.data })
            }).catch((error) => {
                reject({ status: 500, message: 'Error while get cart list' })
                console.log("error while cart added", error)
            })
        }).catch((error) => {
            reject({ status: 500, message: 'Error while get eventId' })
            console.log("error while find event id", error)
        })
    });
}

/**
 * @param {EventHashtag} hashTag 
 * Find eventId using of hashtag
 */
const findEventIdWithHashtag = (hashTag) => {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ 'hashTag': hashTag })
            .exec((error, response) => {
                if (error)
                    //  console.log("error while find =========", error)
                    reject({ status: 500, message: 'Error while get details of event' })
                else {
                    console.log("=================>>>>>>", response)
                    resolve(response._id)
                }
            })
    })
}

/**
 * 
 * @param {EventId} eventId 
 * @param {All cart items} allCart 
 * @param {guest userId} userId 
 * Items added into cart
 */
const itemsAddedInCart = (eventId, allCart, userId) => {
    console.log("event id and all data", allCart)
    return new Promise((resolve, reject) => {
        allCart.forEach((singleCart) => {
            console.log("single item with details", singleCart)
            const itemData = {
                userId: userId,
                eventId: eventId,
                quantity: singleCart.quantity,
                itemId: singleCart.itemId,
            }
            console.log("finall cart item object to push", itemData)
            fncheckForItemInCart(itemData).then((response) => {
                console.log("response of item in cart or not", response)
                if (response == false) {
                    console.log("enter in this")
                    CartModel.findOneAndUpdate({ userId: itemData.userId, itemId: itemData.itemId }, { $set: { quantity: itemData.quantity } }, { upsert: true, new: true })
                        .exec((error, quantityUpdate) => {
                            if (error)
                                //  console.log("error while update quantity")
                                reject({ status: 500, message: 'Error while update quantity' })
                            else {
                                console.log("quantity has been changed", quantityUpdate)
                                cartItemList(eventId, userId).then((response) => {
                                    console.log("response of all items list", response)
                                    resolve({ status: 200, message: 'Item Added Successfully.', data: response });
                                }).catch((error) => {
                                    console.log("error while get items list", error)
                                    reject({ status: 500, message: 'Error while get details of items' });
                                })
                            }
                        })
                } else {
                    console.log("enter in final else part")
                    CartModel.create(itemData, (itemError, newItem) => {
                        if (itemError) {
                            console.log('Itemerror: ', itemError);
                            reject({ status: 500, message: 'Internal Server Error' });
                        } else {
                            cartItemList(eventId, userId).then((response) => {
                                console.log("response of all items list", response)
                                resolve({ status: 200, message: 'Item Added Successfully.', data: response });
                            }).catch((error) => {
                                console.log("error while get items list", error)
                                reject({ status: 500, message: 'Error while get details of items' });
                            })
                            console.log("items added in data base", newItem)
                        }
                    });
                }
            }).catch((error) => {
                console.log("error while check item in cart", error)
                reject({ status: 500, message: 'Error while find item in cart' })
            })
        })
    })
}



/**
 * Function For Check Item Already In Cart Or Not
 * @param {object} itemData 
 * @returns {Promise} return Boolen or reason why failed
 */
function fncheckForItemInCart(itemData) {
    console.log("data to check item in cart", itemData)
    return new Promise((resolve, reject) => {
        CartModel.findOne({ userId: itemData.userId, itemId: itemData.itemId }, (error, Item) => {
            console.log("item ===========", Item)
            if (!Item) {
                console.log("first if call")
                resolve(true)
            } else if (error) {
                console.log("Internal Server Error", error);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log("final  call")
                resolve(false);
            }
        });
    });
}

/**
 * Function For Updated Item Of Cart
 * @param {itemData} - itemData Object As a Input 
 * @returns {Promise} - Updated Cart Item
 */
module.exports.updateItemToCart = (itemData) => {
    return new Promise((resolve, reject) => {
        CartModel.findByIdAndUpdate({ _id: itemData._id }, itemData, (itemError, updatedItem) => {
            if (itemError) {
                console.log('Itemerror: ', itemError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'ItemCart updated Successfully.', data: updatedItem });
            }
        });
    });
}

/**
 * event list of all cartItem Using UserId and EventId 
 * @param {String} eventId eventId Of Event
 * @param {String} userId userId Of User
 * @returns {Promise}- All Cart Item List or reason why failed
 */
const cartItemList = (eventId, userId) => {
    console.log("EventId and UserId", eventId, userId);
    return new Promise((resolve, reject) => {
        CartModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'userId': ObjectId(userId) },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$itemId' },
                    pipeline: [{
                        $unwind: '$item' // $expr cannot digest arrays so we need to unwind
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities' // $expr cannot digest arrays so we need to unwind
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    quantity: '$quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    groupName: '$GroupDetail.groupName',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id'
                }
            }
        ]).exec(function (cartListError, cartList) {
            if (cartListError) {
                reject({ status: 500, message: 'Internal Server Error', data: cartListError });
            } else {
                console.log("cart list response", cartList)
                // resolve(cartList)
                eventDetail(eventId).then((response) => {
                    const cartDetail = {};
                    cartDetail.eventDetail = response.data;
                    cartDetail.cartList = cartList;
                    resolve({ status: 200, message: 'Cart Item List!', data: cartDetail });
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error', data: cartListError });
                })
            }
        });
    });
}

/**
* Remove Item From Cart Function
* @param {cartId} - Cart Item Id
* @returns {Promise} - Removed Item or reason why failed
*/
module.exports.removeItemFromCart = (cartId) => {
    console.log("cart id", cartId)
    return new Promise((resolve, reject) => {
        CartModel.findOneAndRemove({ 'itemId': cartId }).exec((error, response) => {
            if (error) {
                console.log("error while remove cart items", error)
                // reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log("response of removed items", response)

                resolve({ status: 200, message: 'Item Removed Suucessfully' });
            }
        });
    });
}

/**
* Event Joining Thru Event Link Using
* @param {Json} - EventId and UserId
* @returns {Promise} - Event Join Successfully or reason why failed
*/
module.exports.eventJoining = (userId, details) => {
    console.log("platform", details)
    return new Promise((resolve, reject) => {
        // console.log('EventId', eventId);
        console.log('UserId', userId);
        let obj = {
            _id: userId,
            platForm: details.platForm
        }
        fnCheckForCelebrant(details.eventId, userId).then((response) => {
            console.log("response of that it is celebrant or not", response)
            if (response == false) {
                console.log("this is not celebrant")
                fnIsGuestJoined(details.eventId, userId, function (IfUserNotJoined) {
                    console.log("what is the response of event join", IfUserNotJoined)
                    if (IfUserNotJoined) {
                        EventModel.findByIdAndUpdate({ _id: details.eventId }, { $push: { guest: obj } }, { new: true }, (error, eventDetail) => {
                            if (error) {
                                console.log('Event Not Found:', error);
                                reject({ status: 500, message: 'Internal Server Error' });
                            } else {
                                console.log("event join response", eventDetail)
                                resolve({ status: 200, message: 'Event Join Successfully.', data: eventDetail });
                            }
                        });
                    } else {
                        console.log("User Already Join This Event");
                        reject({ status: 400, message: 'User Already Join This Event', data: eventDetail });
                    }
                });
            } else {
                console.log("celebrant try to join his event")
                reject({ status: 500, message: 'You are not authorized to join this event' })
            }
        }).catch((error) => {
            console.log("error while check", error)
            reject({ status: 500, message: 'Error while find login user details' })
        })


    });
}


/**
 * Function For Check User Already Join Event Or Not
 * @param {string} eventId Id Of Event
 * @param {string} userId Id Of User 
 * @param {callback} next return true or false 
 */

function fnIsGuestJoined(eventId, userId, next) {
    console.log('EventId,userId', eventId, userId);
    EventModel.findOne({ _id: eventId, 'guest._id': userId }, (eventError, event) => {
        if (eventError) {
            console.log("Error:", eventError);
            next(false)
        } else if (event) {
            console.log("User Already Join");
            next(false)
        } else {
            console.log("User Not Join Event");
            next(true)
        }
    });
}

/**
 * Update Cart Item With Updated New Quntity
 * @param {object} body - Array Of Cart Item To Update
 * @returns {Promise} - Updated Item List or reason why failed
 */
module.exports.updateItemFromCart = (cartItem) => {
    return new Promise((resolve, reject) => {
        async.eachSeries(cartItem, (singleItem, callback) => {
            const newItem = {
                quantity: parseInt(singleItem.quantity),
            }
            CartModel.findOneAndUpdate({ _id: singleItem._id }, newItem, { upsert: true }, (activityError, newActivity) => {
                if (activityError) {
                    console.log('Cart Update Error: ', activityError);
                    reject({ status: 500, message: 'Internal Server Error' });
                } else {
                    callback();
                }
            });
        }, (callbackError, callbackResponse) => {
            if (callbackError) {
                console.log('callbackError: ', callbackError);
            } else {
                resolve({ status: 200, message: 'Cart Updated Successfully.' });
            }
        });
    });
}


/**
 * 
 * @param {donationDetails} donation 
 * Add donation in event of guest user
 */
function addDonation(donation, userId) {
    console.log("donation details", donation)
    return new Promise((resolve, reject) => {
        findEventIdWithHashtag(donation.eventId).then((response) => {
            console.log("response of eventid", response)
            donation['eventId'] = response
            UserModel.findOne({
                _id: userId,
                'donationOfEvent.eventId': response,
                donationOfEvent: {
                    $elemMatch: {
                        eventId: response
                    }
                }
            },
                {
                    donationOfEvent: {
                        $elemMatch: {
                            eventId: response
                        }
                    }
                })
                .exec((error, response) => {
                    if (error) console.log("error while get donation of event", error)
                    else {
                        console.log("get donation details", response)
                        if (response != null) {
                            const donationId = response.donationOfEvent[0]._id
                            console.log("call this for second time")
                            UserModel.findByIdAndUpdate({ _id: userId },
                                { $set: { 'donationOfEvent.$[donationOfEvent].donation': donation.donation } },
                                { arrayFilters: [{ 'donationOfEvent._id': donationId }] }
                            ).exec((error, donationUpdate) => {
                                if (error)
                                    //  console.log("error while update donation", error)
                                    reject({ status: 500, message: 'Error while update donation' })
                                else {
                                    console.log("donation update", donationUpdate)
                                    resolve({ message: 'Donation update' })
                                }
                            })
                        } else {
                            UserModel.findByIdAndUpdate({ _id: userId }, { $push: { donationOfEvent: donation } }, { upsert: true, new: true })
                                .exec((error, donationAdded) => {
                                    if (error)
                                        //  console.log("eror while add donation", error)
                                        reject({ status: 500, message: 'Error while add donation' })
                                    else {
                                        console.log("donatio added in databasse", donationAdded)
                                        resolve({ message: 'Donation add in event cart' })
                                    }
                                })
                        }
                    }
                })
        }).catch((error) => {
            console.log("error while add donation", error)
            reject({ status: 500, message: 'Error while get event id' })
        })
    })
}

/**
 * @param {LoginId} userId 
 * @param {eventHashtag} hashTag 
 * Get donation of login user of single event
 */
function getDonation(userId, hashTag) {
    return new Promise((resolve, reject) => {
        findEventIdWithHashtag(hashTag).then((response) => {
            console.log("event id", response)
            const eventId = response
            UserModel.aggregate([
                {
                    $match: {
                        '_id': ObjectId(userId)
                    }
                },
                {
                    $project: {
                        _id: '$_id',
                        donation: {
                            $filter: {
                                input: '$donationOfEvent',
                                as: "eventId",
                                cond: {
                                    $eq: ['$$eventId.eventId', ObjectId(eventId)]
                                }
                            },
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$donation'
                    }
                }
            ]).exec((error, donationGet) => {
                if (error)
                    //  console.log("error while get donation", error)
                    reject({ status: 500, message: 'Error while get donation details' })
                else {
                    console.log("donation details", donationGet)
                    if (donationGet.length) {
                        resolve({ data: donationGet[0].donation })
                    } else {
                        resolve({ message: 'There is no donation' })
                    }
                }
            })
        }).catch((error) => {
            console.log("error while get event id", error)
            reject({ status: 500, message: 'Error while get event id' })
        })
    })
}


/**
 * 
 * @param {Guest User} userId 
 * @param {EventHashTag} hashTag 
 */
function getTotalOfCart(userId, hashTag) {
    return new Promise((resolve, reject) => {
        findEventIdWithHashtag(hashTag).then((eventId) => {
            cartItemList(eventId, userId).then((itemList) => {
                grandTotal = 0
                let cartList = itemList.data.cartList
                console.log("total item of cart", cartList)
                cartList.forEach((singleCartItem) => {
                    subTotal = singleCartItem.itemPrice * singleCartItem.quantity
                    grandTotal = grandTotal + subTotal
                    finalGrandTotal = grandTotal
                })
                console.log("final total of all items", finalGrandTotal)
                UserModel.findOne({
                    _id: userId,
                    'donationOfEvent.eventId': eventId,
                    donationOfEvent: {
                        $elemMatch: {
                            eventId: eventId
                        }
                    }
                },
                    {
                        donationOfEvent: {
                            $elemMatch: {
                                eventId: eventId
                            }
                        }
                    }).exec((error, donationDetails) => {
                        if (error)
                            // console.log("error while get donation", error)
                            reject({ status: 500, message: 'Error while get donation' })
                        else {
                            // console.log("donation details", donationDetails)
                            let finalDonation = donationDetails.donationOfEvent[0].donation
                            finalGrandTotal = finalGrandTotal + finalDonation
                            // console.log("hve sav final mdvu joye", finalGrandTotal)
                            resolve({ total: finalGrandTotal, donation: donationDetails.donationOfEvent[0].donation })
                        }
                    })
            }).catch((error) => {
                reject({ status: 500, message: 'error while get items of cart' })
                console.log("error while get items of cart", error)
            })
        }).catch((error) => {
            reject({ status: 500, message: 'error while get event id' })
            console.log("error while get event id", error)
        })
    })
}

/**
 * 
 * @param {AccountDetails} data 
 * @param {loginUser} userId 
 * @param {AccountType} finalFlage 
 */
function addAccountDetails(data, userId, finalFlage) {
    return new Promise((resolve, reject) => {
        if (finalFlage == false) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $set: { bankAccount: data } }, { upsert: true, new: true })
                .exec((error, accountAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add bank details' })
                    else {
                        resolve({ message: 'Bank account added' })
                        console.log("get details of account", accountAdded)
                    }
                })
        }
        if (finalFlage == true) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $set: { cardAccount: data } }, { upsert: true, new: true })
                .exec((error, cardAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add card details' })
                    else {
                        // console.log("get details of account", cardAdded)
                        resolve({ message: 'Card Details added' })
                    }
                })
        }
    })
}


function getAccountDetails(userId, accountType) {
    return new Promise((resolve, reject) => {
        UserModel.findById({ _id: userId })
            // .populate('bankAccount cardAccount')
            .exec((error, details) => {
                if (error)
                    //  console.log("error while get details", error)
                    reject({ status: 500, message: 'Error while get details of account' })
                else {
                    console.log("details of guest account", details)
                    if (accountType == 'account') {
                        resolve({ data: details.bankAccount })
                    } else if (accountType == 'card') {
                        resolve({ data: details.cardAccount })
                    }
                }
            })
    })
}


/**
 *Cart list of all cartItem Using UserId and EventId with Total 
 * @returns {Promise} - All Cart Item List or reason why failed
 */
module.exports.cartItemListWithTotal = (eventId, userId) => {
    console.log("EventId and UserId", eventId, userId);
    return new Promise((resolve, reject) => {
        CartModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'userId': ObjectId(userId) },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    quantity: 1,
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    groupName: '$GroupDetail.groupName',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id'
                }
            }
        ]).exec(function (eventListError, itemList) {
            if (eventListError) {
                console.log("eventListError", eventListError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                eventDetail(eventId).then((response) => {
                    const cartData = { cartItem: itemList, eventDetail: response.data }
                    resolve({ status: 200, message: 'Event List!', data: cartData });
                }).catch((err) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    });
}

/**
* Final Order Checkout With Donation and Delivery Address
* @param {Json} - Order Data With Item List
* @returns {Promise} - Order Placed Successfully or reason why failed
*/
module.exports.orderCheckout = (userId, cartData) => {
    return new Promise((resolve, reject) => {

        const newTransaction = {
            donation: cartData.donationAmount,
            userId: userId,
            item: cartData.Item,
            eventId: cartData.eventId,
            finalTotal: cartData.finalTotal,
            deliveryAddress: cartData.addressFinal,
            item: [],
        }

        _.forEach(cartData.orderDetails, (singleOrder) => {
            newTransaction.item.push(singleOrder);
        })

        TransactionModel.create(newTransaction, (transactionError, transaction) => {
            if (transactionError) {
                console.log('Transaction Error:', transactionError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                // console.log("trancation is completed", transaction)
                clearCartAfterCheckout(userId, cartData.eventId).then((response) => {
                    findEmailUsingUserId(userId).then((response) => {
                        const email = response.data.email;
                        findMessageUsingEventId(cartData.eventId).then((response) => {
                            console.log("response of final when trancation is created", response)
                            const messageData = {};
                            messageData.eventHashTag = response.data.hashTag
                            messageData.eventTitle = response.data.eventTitle
                            messageData.image = config.ngrockUrl + response.data.profilePhoto
                            if (response.data.thankyouMessage == '') {
                                messageData.message = '';
                            } else {
                                messageData.message = response.data.thankyouMessage;
                            }

                            // if (response.data.thanksMessage.attachment == '') {
                            //     messageData.image = '';
                            // } else {
                            //     messageData.image = config.ngrockUrl + response.data.thanksMessage.attachment;
                            // }

                            console.log('Message Data:', messageData);

                            const defaultPasswordEmailoptions = {
                                to: email,
                                subject: 'Thanks For Contribution To Aso-Ebi',
                                template: 'thanks-message'
                            };

                            paymentThankYouDetails(transaction.eventId).then((response) => {
                                console.log("response of created event with name", response)
                                let thankYouDetails = {
                                    finalTotal: transaction.finalTotal + transaction.donation,
                                    createrName: response.data
                                }
                                mailService.mail(defaultPasswordEmailoptions, messageData, null, function (err, mailResult) {
                                    console.log('Mail Result:', mailResult);
                                    if (err) {
                                        resolve({ status: 200, message: 'Order Placed successfully but mail not sent for some reason' });
                                    } else {
                                        console.log("mail send for purchase to guest", mailResult)
                                        // resolve({ status: 200, message: 'Order Placed successfully' })
                                        resolve({ data: thankYouDetails, message: 'Payment Successfully Done' })
                                    }
                                })
                            }).catch((error) => {
                                console.log("error while get name of creater", error)
                                reject({ status: 500, message: 'Error while get details of user' })
                            })
                        }).catch((error) => {
                            reject({ status: 500, message: 'Internal Server Error', data: error });
                        });
                    }).catch((error) => {
                        reject({ status: 500, message: 'Internal Server Error', data: error });
                    });
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error', data: error });
                });
            }
        })
    })
}

/**
 * @param {EventId} eventId 
 * Get creater details of event
 */
const paymentThankYouDetails = (eventId) => {
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            {
                $match: {
                    _id: ObjectId(eventId)
                }
            },
            {
                $project: {
                    userId: '$userId'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {
                        userId: '$userId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1
                            }
                        }
                    ],
                    as: 'userId'
                }
            },
            {
                $unwind: {
                    path: '$userId',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).exec((error, createrDetails) => {
            if (error)
                // console.log("error while get details of creater event", error)
                reject({ status: 500, message: 'Error while get details of creater details' })
            else {
                console.log("details of event creataer", createrDetails)
                resolve({ data: createrDetails[0].userId })
            }
        })
    })
}



/**
 * Function To Find User Detail Using UserId
 * @param {String} userId UserId Of User 
 * @returns {Promise} User Detail Of User
 */
const findEmailUsingUserId = (userId) => {
    return new Promise((resolve, reject) => {
        console.log('UserId In Email Function:', userId);
        UserModel.findById({ _id: userId }, (userErr, userRes) => {
            if (userErr) {
                console.log('User Error:', userErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'User Detail Fetch Successfully', data: userRes });
            }
        });
    });
}

/**
 * Function To Find Thanks Message Detail Using EventId
 * @param {String} eventId eventId Of Event 
 * @returns {Promise} Event Detail Of Event
 */
const findMessageUsingEventId = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('eventId In Email Function:', eventId);
        EventModel.findById({ _id: eventId }, (eventErr, eventRes) => {
            if (eventErr) {
                console.log('Event Error:', eventErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Event Detail Fetch Successfully', data: eventRes });
            }
        });
    });
}


/**
 * Function To Clear Cart Item After Successfully Checkout Process
 * @param {String} userId UserId Of User
 * @param {String} eventId EventId Of Event
 * @returns {Promise} return Promise or Reason to failed
 */
const clearCartAfterCheckout = (userId, eventId) => {
    return new Promise((resolve, reject) => {
        CartModel.deleteMany({ eventId: eventId, userId: userId }, (cartErr, cartRes) => {
            if (cartErr) {
                console.log('Cart Clear Error:', cartErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log('Cart Clear Response', cartRes);
                resolve({ status: 200, message: 'Cart Clear Successfully', data: cartRes });
            }
        });
    });
}

// Get All The Counts For Admin Dashboard

module.exports.getCountForAdminDashboard = function (req, res) {
    return new Promise((resolve, reject) => {
        let adminDashBoardCounts = {};
        fnGetTotalEventsCounts(function (totalEventCount) {
            adminDashBoardCounts.totalEventCount = totalEventCount;
            fnGetTotalUsersCounts(function (totalUserCount) {
                adminDashBoardCounts.totalUserCount = totalUserCount;
                fnGetTotalCollectionAmount(function (totalCollectionAmount) {
                    adminDashBoardCounts.totalCollection = totalCollectionAmount;
                    fnGetTransactionCount(function (totalTransaction) {
                        adminDashBoardCounts.totalTransaction = totalTransaction;
                        resolve({ status: 200, message: 'Successfully get Dashboard Counts', data: adminDashBoardCounts });
                    });
                });
            });
        });
    });
}

/**
 * Function For Total Events Counts
 * @param {callback} callback
 * @returns {object} return total event count 
 */
function fnGetTotalEventsCounts(callback) {
    EventModel.find().countDocuments().exec(function (err, eventCount) {
        if (err) return callback(err);
        return callback(eventCount);
    });
}

/**
 * Function For Total Events Counts
 * @param {callback} callback
 * @returns {object} return total event count 
 */
function fnGetTransactionCount(callback) {
    TransactionModel.find().countDocuments().exec(function (err, eventCount) {
        if (err) return callback(err);
        return callback(eventCount);
    });
}

/**
 * Function For Total User Counts
 * @param {userCount} callback 
 */
function fnGetTotalUsersCounts(callback) {
    UserModel.find().countDocuments().exec(function (err, userCount) {
        if (err) return callback(err);
        return callback(userCount);
    });
}

/**
 * Function For Total Collected Amount
 * @param {transactionTotal} callback 
 */
function fnGetTotalCollectionAmount(callback) {
    TransactionModel.aggregate([
        {
            $group: {
                _id: null,
                grandTotal: {
                    $sum: '$finalTotal'
                }
            }
        }
    ]).exec(function (err, transaction) {
        if (err) {
            return callback(err);
        } else {
            if (transaction == '') {
                return callback(0);
            } else {
                return callback(transaction[0].grandTotal);
            }
        }
    });
}

const fneventDetailOnly = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            //Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            //Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    userId: '$userId',
                    startDate: '$startDate',
                    guest: '$guest',
                    endDate: '$endDate',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    eventLink: '$eventLink',
                    eventTheme: '$eventTheme',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    activities: '$activities'
                }
            },
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                reject(eventDetailError);
            } else {
                console.log('Event Detail:', eventDetail);
                resolve(eventDetail);
            }
        });
    });
}

/**
 * Event Detail With Guest List and Creator Details
 * @param {eventId} - EventId for Delete Event
 * @returns {Promise} - Event Detail or reason why failed
 */
const eventDetailWithActivity = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            //Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            //Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    userId: '$userId',
                    startDate: '$startDate',
                    guest: '$guest',
                    endDate: '$endDate',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    eventLink: '$eventLink',
                    eventTheme: '$eventTheme',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    activities: '$activities'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'eventCreator'
                }
            },
            {
                $unwind: {
                    path: '$eventCreator',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    eventCreator: {
                        userId: '$eventCreator._id',
                        firstName: '$eventCreator.firstName',
                        lastName: '$eventCreator.lastName',
                        mobile: '$eventCreator.mobile',
                        email: '$eventCreator.email',
                    },
                    hashTag: 1,
                    eventType: 1,
                    eventTitle: 1,
                    isPublic: 1,
                    userId: 1,
                    startDate: 1,
                    guest: 1,
                    endDate: 1,
                    hashTag: 1,
                    profilePhoto: 1,
                    eventLink: 1,
                    eventTheme: 1,
                    paymentDeadlineDate: 1,
                    activities: 1,
                }
            },
            //unwind Activity Array To Json Object
            {
                $unwind: {
                    path: '$activities',
                    preserveNullAndEmptyArrays: true
                }
            },
            //Reduce To Limited Activity Data Using Project
            {
                $project: {
                    eventId: '$_id',
                    hashTag: 1,
                    eventType: 1,
                    eventTitle: 1,
                    isPublic: 1,
                    userId: 1,
                    startDate: 1,
                    endDate: 1,
                    profilePhoto: 1,
                    paymentDeadlineDate: 1,
                    eventLink: 1,
                    eventTheme: 1,
                    guest: 1,
                    eventCreator: 1,
                    activity: {
                        activityId: '$activities._id',
                        activityName: '$activities.activityName',
                        eventId: '$activities.eventId',
                        activityDate: '$activities.activityDate'
                    },
                }
            },
            //Lookup Of Group Using ActivityId
            {
                $lookup: {
                    from: 'group',
                    let: { activityId: '$activity.activityId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$activityId', '$activityId'] },
                                        { $eq: ['$isDeleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activity.group'
                }
            },
            //unwind Group Array To Json Object
            {
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true
                }
            },
            //Make Group Of Final Multiple Data to Single Object
            {
                $group: {
                    _id: '$_id',
                    hashTag: {
                        $first: '$hashTag',
                    },
                    eventType: {
                        $first: '$eventType',
                    },
                    eventTitle: {
                        $first: '$eventTitle',
                    },
                    isPublic: {
                        $first: '$isPublic',
                    },
                    userId: {
                        $first: '$userId',
                    },
                    startDate: {
                        $first: '$startDate',
                    },
                    endDate: {
                        $first: '$endDate',
                    },
                    profilePhoto: {
                        $first: '$profilePhoto'
                    },
                    paymentDeadlineDate: {
                        $first: '$paymentDeadlineDate',
                    },
                    activity: {
                        $push: '$activity',
                    },
                    eventLink: {
                        $first: '$eventLink',
                    },
                    eventTheme: {
                        $first: '$eventTheme',
                    },
                    guest: {
                        $first: '$guest',
                    },
                    eventCreator: {
                        $first: '$eventCreator',
                    }
                }
            },
            //Lookup For Guest Detail From User Model
            {
                $lookup: {
                    from: 'users',
                    localField: 'guest',
                    foreignField: '_id',
                    as: 'guestDetail'
                }
            },
            //Unwind GuestDetail Array For Project Operation
            {
                $unwind: {
                    path: '$guestDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: { 'guestDetail.firstName': 1, } },
            //Project For Limited The Data Collection
            {
                $project: {
                    guestDetail: {
                        userId: '$guestDetail._id',
                        firstName: '$guestDetail.firstName',
                        lastName: '$guestDetail.lastName',
                        mobile: '$guestDetail.mobile',
                        email: '$guestDetail.email'
                    },
                    hashTag: 1,
                    eventType: 1,
                    eventTitle: 1,
                    isPublic: 1,
                    userId: 1,
                    startDate: 1,
                    guest: 1,
                    endDate: 1,
                    hashTag: 1,
                    profilePhoto: 1,
                    eventLink: 1,
                    eventTheme: 1,
                    paymentDeadlineDate: 1,
                    eventCreator: 1,
                    activity: 1,
                },
            },
            //Final Group For Merging Documents and Generate Respective Arrays  
            {
                $group: {
                    _id: '$_id',
                    hashTag: {
                        $first: '$hashTag',
                    },
                    eventType: {
                        $first: '$eventType',
                    },
                    eventTitle: {
                        $first: '$eventTitle',
                    },
                    isPublic: {
                        $first: '$isPublic',
                    },
                    userId: {
                        $first: '$userId',
                    },
                    startDate: {
                        $first: '$startDate',
                    },
                    endDate: {
                        $first: '$endDate',
                    },
                    profilePhoto: {
                        $first: '$profilePhoto'
                    },
                    paymentDeadlineDate: {
                        $first: '$paymentDeadlineDate',
                    },
                    eventLink: {
                        $first: '$eventLink',
                    },
                    eventTheme: {
                        $first: '$eventTheme',
                    },
                    activity: {
                        $push: '$activity',
                    },
                    eventCreator: {
                        $first: '$eventCreator',
                    },
                    guestDetail: {
                        $push: '$guestDetail'
                    },
                }
            },
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                console.log("Event Detail Error:", eventDetailError);
                reject(eventDetailError);
            } else {
                fnListOfGuestThatMadePayment(eventId).then((response) => {
                    eventDetail[0].guestListWithPayment = response.data;
                    resolve({ status: 200, message: 'Event Detail With Guest!', data: eventDetail[0] });
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                });
            }
        });
    });
}

/**
 *Cart list of GroupWise Using EventId
 * @returns {Promise} - All Group Wise Item List or reason why failed
 * @param {eventId} - EventId As a Input Parameter
 */
function fnGroupWiseItemCollection(eventId) {
    return new Promise((resolve, reject) => {
        console.log("EventId In fnGroupWiseItemCollection ", eventId);
        GroupModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    groupId: '$_id',
                    groupName: '$groupName',
                    Items: '$item'
                }
            },
            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'cart',
                    let: { 'itemsId': '$itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemsId'] } }
                    },],
                    as: 'ItemDetail'
                }
            },
        ]).exec(function (eventListError, itemList) {
            if (eventListError) {
                console.log("Error:", eventListError);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'ItemList Successfully', data: itemList });
            }
        });
    });
}

/**
 *Guest list Of With Payment Completed
 * @returns {Promise} - All Guest List or reason why failed
 * @param {eventId} - EventId As a Input For Function
 */
function fnListOfGuestThatMadePayment(eventId) {
    return new Promise((resolve, reject) => {
        console.log("EventId In fnListOfGuestThatMadePayment ", eventId);
        TransactionModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'guestDetail'
                }
            },
            {
                $unwind: {
                    path: '$guestDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userId: '$guestDetail._id',
                    firstName: '$guestDetail.firstName',
                    lastName: '$guestDetail.lastName',
                    mobile: '$guestDetail.mobile',
                    email: '$guestDetail.email'
                }
            },
        ]).exec(function (UserListError, UserList) {
            if (UserListError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'User List fetched Successfully', data: UserList });
            }
        });
    });
}

/**
 *Event Search Using Hashtag For AdminSide
 * @returns {Promise} - All Event List that Contains That Hashtags or reason why failed
 * @param {keyword} - Keyword To search Inside Event Hashtag
 */
module.exports.eventListUsingHashTag = (keyword) => {
    return new Promise((resolve, reject) => {
        const searchText = keyword;
        console.log('search text:', searchText);

        // query Contain isDeleted Condition
        const query = {
            $and: [{ 'isDeleted': false }]
        }

        // If Keyword For HashTag Searching
        if (keyword) {
            query['$and'].push({ 'hashTag': { $regex: new RegExp(searchText, 'i') } });
        }

        EventModel.aggregate([
            {
                $match: query
            },
            {
                $project: {
                    hashTag: '$hashTag',
                    eventType: '$eventType',
                    eventTitle: '$eventTitle',
                    isPublic: '$isPublic',
                    hashTag: '$hashTag',
                    profilePhoto: '$profilePhoto',
                    paymentDeadlineDate: '$paymentDeadlineDate',
                    eventTheme: '$eventTheme',
                    isPaymentAccept:
                    {
                        $cond: { if: { $lt: ["$paymentDeadlineDate", new Date()] }, then: false, else: true }
                    }
                }
            },
        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject(eventListError);
            } else {
                resolve({ status: 200, message: 'Fetch Event List Successfully!', data: eventList });
            }
        });
    });
}


/**
 * Total collection of event with activity
 */
const totalCollectionActivityWise = (eventId) => {
    return new Promise((resolve, reject) => {
        TransactionModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    trancationId: '$_id',
                    items: '$item'
                }
            },
            {
                $unwind: {
                    path: '$items'
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: { itemId: '$items.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'items'
                }
            },
            {
                $unwind: {
                    path: '$items'
                }
            },
            {
                $group: {
                    _id: '$items.activityId',
                    item: {
                        $push: '$items'
                    }
                }
            },
            // {
            //     $project: {
            //         _id: '$_id',
            //         groupName: '$item.groupName',
            //         groupItem: '$item.item'
            //     }
            // },
        ]).exec((error, finalData) => {
            if (error) console.log("error while get total", error)
            else {

                console.log("get total activity wise", finalData)
                resolve({ data: finalData })
            }
        })
    })
}



/**
 * Transaction Model approach For Collection Details
 * @param {String} eventId 
 * @returns {Promise} Collection Detail Acording Group Of Particular Event
 */
const activityWiseCollection = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('EventId In Group Wise Collection', eventId);
        TransactionModel.aggregate([
            // $match Using EventId
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },

            // $unwind Item Array For Lookup

            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },

            // $lookup In Group Model For GroupDetail

            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$item.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },

            // $unwind GroupDetail Array For Lookup Operation

            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },

            // $lookup In Event Model For Activity Detail

            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    },
                    // { $sort: { "activities.createdAt": 1 } },
                    {
                        $match: {
                            $expr:
                            {
                                $and: [
                                    // { $sort: { "activities.createdAt": -1 } },
                                    { $eq: ['$activities._id', '$$activityId'] },
                                ]
                                // $eq: ['$activities._id', '$$activityId']
                            }
                        }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },

            // $unwind Array Of Activity Inside Item Inside GroupDetail

            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },

            // $project for Limit The Data

            {
                $project: {
                    itemQuantity: '$item.quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    activityId: '$GroupDetail.item.activity.activities._id',
                    groupName: '$GroupDetail.groupName',
                    groupId: '$GroupDetail._id',
                    // itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    // itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id',
                }
            },

            // $project for Limit The Data Using Project And Make Object Of Item

            {
                $project:
                {
                    activityId: 1,
                    activityName: 1,
                    item: {
                        itemId: '$itemId',
                        // itemName: '$itemName',
                        groupId: '$groupId',
                        groupName: '$groupName',
                        itemPrice: '$itemPrice',
                        itemQuantity: '$itemQuantity',
                        // itemType: '$itemQuantity',
                        itemGender: '$itemGender',
                        total: { $multiply: ["$itemPrice", "$itemQuantity"] },
                    },
                }
            },

            // $group Using ActivityName and GroupName

            {
                $group: {
                    _id: { activityName: '$activityName', groupName: '$item.groupName' },
                    item: {
                        $push: '$item'
                    }
                }
            },

            // $project Using Nested ActivityName
            {
                $project: {
                    _id: "$_id.activityName",
                    groupName: '$_id.groupName',
                    maleTotal: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$item',
                                        as: 'maleTotal',
                                        cond: {
                                            $eq: ['$$maleTotal.itemGender', 'male']
                                        }
                                    },
                                },
                                as: 'maleitem',
                                in: '$$maleitem.total'
                            }
                        }
                    },
                    femaleTotal: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$item',
                                        as: 'femaleTotal',
                                        cond: {
                                            $eq: ['$$femaleTotal.itemGender', 'female']
                                        }
                                    },
                                },
                                as: 'femaleitem',
                                in: '$$femaleitem.total'
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    finalGroup: {
                        $push: {
                            groupName: '$groupName',
                            maleTotal: '$maleTotal',
                            femaleTotal: '$femaleTotal'
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).exec((eventListError, eventList) => {
            if (eventListError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventListError });
            } else {
                console.log("eventList", eventList)
                activityCollection(eventId).then((response) => {
                    console.log('Response:', response);
                    let activityTotal = response.data
                    let grandTotal = 0
                    activityTotal.forEach((byActivity) => {
                        subTotal = byActivity.total
                        grandTotal = grandTotal + subTotal
                        finalGrandTotal = grandTotal
                        console.log("single activity details", finalGrandTotal)
                        eventList.forEach((singleAct) => {
                            if (byActivity.activityName == singleAct._id) {
                                singleAct['total'] = byActivity.total
                            }
                        })
                    })
                    eventTotalCollection(eventId).then((eventTotal) => {
                        const data = {};
                        data.groupWise = eventList;
                        data.eventTotal = eventTotal
                        console.log("total of event ", eventTotal)
                        resolve({ status: 200, message: 'Collected Amount Detail!', data: data });
                        // resolve({ data: eventTotal })
                    }).catch((error) => {
                        console.log("error while get total of event", error)
                        reject({ status: error.status, message: error.message })
                    })
                }).catch((error) => {
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    })
}


/**
 * @param {EventId} eventId 
 * Get total of event and total donation of event
 */
const eventTotalCollection = (eventId) => {
    return new Promise((resolve, reject) => {
        TransactionModel.find({ 'eventId': eventId })
            .exec((error, totalOfEvent) => {
                if (error)
                    //  console.log("error while get total of event", error)
                    reject({ status: 500, message: 'Error while get total of event and donation' })
                else {
                    console.log("total of event", totalOfEvent)
                    if (totalOfEvent && totalOfEvent.length) {
                        grandTotal = 0
                        grandDonation = 0
                        totalOfEvent.forEach((singleEvent) => {

                            console.log("total of single event", singleEvent.finalTotal)
                            // Total Of Event

                            subTotal = singleEvent.finalTotal
                            grandTotal = grandTotal + subTotal
                            finalTotalOfEvent = grandTotal

                            // Total Of Donation
                            if (singleEvent.donation) {
                                subDonation = singleEvent.donation
                                grandDonation = grandDonation + subDonation
                                finalDonationTotal = grandDonation
                            } else {
                                finalDonationTotal = 0
                            }

                        })
                        // console.log("donation", finalDonationTotal)
                        // if (finalDonationTotal && finalTotalOfEvent) {
                        finalGrandTotal = finalDonationTotal + finalTotalOfEvent
                        // }
                        let totalCost = {}
                        totalCost.eventTotal = finalTotalOfEvent
                        totalCost.donationTotal = finalDonationTotal
                        totalCost.finalTotal = finalGrandTotal
                        resolve(totalCost)
                    } else {
                        resolve({ message: 'There is no item purchase in this event' })
                    }
                }
            })
    })
}




/**
 * Guest List With Purcahsed Amount Of Transaction Using EventId
 * @param {String} eventId 
 * @returns {Promise} Return Array Of Guest or Reason Why Failed
 */
const eventGuestListWithAmount = (eventId) => {
    console.log('EventId:', eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([

            // $match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            // $project for Reduce To Limited Data
            {
                $project: {
                    hashTag: '$hashTag',
                    eventId: '$_id',
                    guest: '$guest',
                }
            },
            // $unwind Guest Array For lookup
            {
                $unwind: {
                    path: '$guest',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup For Guest Detail From User Model
            {
                $lookup: {
                    from: 'users',
                    localField: 'guest._id',
                    foreignField: '_id',
                    as: 'guestDetail'
                }
            },
            // $unwind GuestDetail Array For Project Operation
            {
                $unwind: {
                    path: '$guestDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $sort Using Guest FirstName
            { $sort: { 'guestDetail.firstName': -1, } },
            // $project For Limited The Data Collection
            {
                $project: {
                    hashTag: 1,
                    eventId: 1,
                    guestDetail: {
                        userId: '$guestDetail._id',
                        firstName: '$guestDetail.firstName',
                        lastName: '$guestDetail.lastName',
                        mobile: '$guestDetail.address.phoneNo',
                        email: '$guestDetail.address.email',
                        address: '$guestDetail.address.address'
                    },

                },
            },
            {
                $lookup: {
                    from: 'transaction',
                    let: {
                        userId: '$guestDetail.userId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$userId", "$$userId"]
                                }
                            }
                        },
                        {
                            $project: {
                                item: 1,
                                eventId: 1
                            }
                        }
                    ],
                    as: 'cartItems'
                }
            },
            {
                $project: {
                    eventId: 1,
                    hashTag: 1,
                    guestDetail: 1,
                    transactionDetails: {
                        $filter: {
                            input: "$cartItems",
                            as: "transaction",
                            cond: { $and: [{ $eq: ["$$transaction.eventId", ObjectId(eventId)] }] }
                        }
                    }
                }
            },
            // // $unwind TransactionDetail Array For $group 
            {
                $unwind: {
                    path: '$transactionDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$transactionDetails.item',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$guestDetail.userId',
                    guestDetails: {
                        $push: {
                            firstName: '$guestDetail.firstName',
                            lastName: '$guestDetail.lastName',
                            phoneNo: '$guestDetail.mobile',
                            email: '$guestDetail.email',
                            address: '$guestDetail.address',
                            itemId: '$transactionDetails.item.itemId',
                            quantity: '$transactionDetails.item.quantity'
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: '$guestDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'group',
                    let: {
                        items: '$guestDetails'
                    },
                    pipeline: [
                        {
                            $unwind: '$item'
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$item._id", "$$items.itemId"]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                activityId: 1,
                                itemName: '$item.itemName',
                                itemPrice: '$item.itemPrice'
                            }
                        }
                    ],
                    as: 'guestDetails.itemId'
                }
            },
            {
                $unwind: {
                    path: '$guestDetails.itemId'
                }
            },
            {
                $project: {
                    _id: '$_id',
                    guestDetails: {
                        firstName: '$guestDetails.firstName',
                        lastName: '$guestDetails.lastName',
                        phoneNo: '$guestDetails.phoneNo',
                        email: '$guestDetails.email',
                        address: '$guestDetails.address',
                        itemId: '$guestDetails.itemId',
                        quantity: '$guestDetails.quantity'
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    firstName: {
                        $first: '$guestDetails.firstName',
                    },
                    lastName: {
                        $first: '$guestDetails.lastName'
                    },
                    phoneNo: {
                        $first: '$guestDetails.phoneNo'
                    },
                    email: {
                        $first: '$guestDetails.email'
                    },
                    address: {
                        $first: '$guestDetails.address'
                    },
                    items: {
                        $push: {
                            itemId: '$guestDetails.itemId',
                            quantity: '$guestDetails.quantity'
                        }
                    },
                }
            },
            {
                $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'event',
                    let: {
                        activityName: '$items.itemId'
                    },
                    pipeline: [
                        {
                            $unwind: {
                                path: '$activities'
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$activities._id", "$$activityName.activityId"]
                                }
                            }
                        },
                        {
                            $project: {
                                activityName: '$activities.activityName'
                            }
                        }
                    ],
                    as: 'items.itemId.activityId'
                }
            },
            {
                $unwind: {
                    path: '$items.itemId.activityId',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    firstName: {
                        $first: '$firstName',
                    },
                    lastName: {
                        $first: '$lastName'
                    },
                    phoneNo: {
                        $first: '$phoneNo'
                    },
                    email: {
                        $first: '$email'
                    },
                    address: {
                        $first: '$address'
                    },
                    items: {
                        $push: '$items'
                    },
                }
            },
        ]).exec(function (guestListErr, guestListRes) {
            if (guestListErr) {
                console.log("Guest List Error:", guestListErr);
                reject(guestListErr);
            } else {
                resolve({ data: guestListRes })
                resolve({ status: 200, message: 'Event Guest List!', data: guestListRes[0] });
            }
        });
    });
}

/**
 * Event Guest List and Creator Details
 * @param {eventId} - EventId for Delete Event
 * @returns {Promise} - Event Detail or reason why failed
 */
const eventGuestList = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            // Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            // Reduce To Limited Data Using Project
            {
                $project: {
                    guest: '$guest',
                }
            },
            {
                $unwind: {
                    path: '$guest'
                }
            },
            {
                $project: {
                    userId: '$guest._id',
                    platForm: '$guest.platForm'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {
                        userName: '$userId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userName"]
                                }
                            }
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                // platForm: '$guest.platForm'
                            }
                        }
                    ],
                    as: 'userId'
                }
            },
            {
                $unwind: {
                    path: '$userId'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    user: {
                        $push: {
                            userName: '$userId',
                            platForm: '$platForm'
                        }
                    }
                }
            },
            {
                $project: {
                    totalGuest: '$user',
                    whatsUpList: {
                        $filter: {
                            input: '$user',
                            as: 'whatsUp',
                            cond: {
                                $eq: ["$$whatsUp.platForm", "WP"]
                            }
                        }
                    },
                    googleList: {
                        $filter: {
                            input: '$user',
                            as: 'google',
                            cond: {
                                $eq: ["$$google.platForm", "GM"]
                            }
                        }
                    },
                    faceBookList: {
                        $filter: {
                            input: '$user',
                            as: 'facebook',
                            cond: {
                                $eq: ["$$facebook.platForm", "FB"]
                            }
                        }
                    },
                    textMessageList: {
                        $filter: {
                            input: '$user',
                            as: 'text',
                            cond: {
                                $eq: ["$$text.platForm", "TX"]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    totalGuest: {
                        $push: '$totalGuest'
                    },
                    whatsUpList: {
                        $push: '$whatsUpList'
                    },
                    googleList: {
                        $push: '$googleList'
                    },
                    faceBookList: {
                        $push: '$faceBookList'
                    },
                    textMessageList: {
                        $push: '$textMessageList'
                    }
                }
            }
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                console.log("Guest List Error:", eventDetailError);
                reject(eventDetailError);
            } else {
                resolve({ status: 200, message: 'Event Guest List!', data: eventDetail });
            }
        });
    });
}


/**
 * Eventwise Total Collection And Donation Amount  
 * @param {eventDetail} eventId 
 */
const eventDonationDetail = (eventId) => {
    return new Promise((resolve, reject) => {
        let collectionDetail = {};
        console.log('EventId In Donation Collection', eventId);
        TransactionModel.aggregate([
            // Match Using EventId
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            // Unwind Item Array For Lookup
            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup In Group Model For GroupDetail
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$item.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            // Unwind GroupDetail Array For Lookup Operation
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup In Event Model For Activity Detail
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            // Unwind Array Of Activity Inside Item Inside GroupDetail
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Limit The Data Using Project
            {
                $project: {
                    itemQuantity: '$item.quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    activityId: '$GroupDetail.item.activity.activities._id',
                    groupName: '$GroupDetail.groupName',
                    groupId: '$GroupDetail._id',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id',
                    eventId: '$eventId',
                }
            },
            // Limit The Data Using Project And Make Object Of Item
            {
                $project:
                {
                    activityId: 1,
                    activityName: 1,
                    eventId: 1,
                    hashTag: 1,
                    item: {
                        itemId: '$itemId',
                        itemName: '$itemName',
                        groupId: '$groupId',
                        groupName: '$groupName',
                        itemPrice: '$itemPrice',
                        itemQuantity: '$itemQuantity',
                        itemType: '$itemQuantity',
                        itemGender: '$itemGender',
                        total: { $multiply: ["$itemPrice", "$itemQuantity"] },
                    },
                }
            },
            {
                $group: {
                    _id: '$eventId',
                    totalCollection: {
                        $sum: '$item.total'
                    },
                }
            },
        ]).exec(function (collectionErr, collectionRes) {
            if (collectionErr) {
                console.log('Error', collectionErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                eventDetail(eventId).then((hashTag) => {
                    fnGetTotalDonationAmount(eventId).then((response) => {
                        console.log('Collection Response', collectionRes);
                        console.log('Donation Response', response);
                        collectionDetail.totalDonation = response;
                        if (collectionRes == '') {
                            collectionDetail.totalCollection = 0;
                        } else {
                            collectionDetail.totalCollection = collectionRes[0].totalCollection;
                        }
                        collectionDetail.finalTotal = response + collectionDetail.totalCollection;
                        collectionDetail.eventHashTag = hashTag.data.hashTag;
                        resolve({ status: 200, message: 'Successfully get collection Detail', data: collectionDetail });
                    }).catch((error) => {
                        console.log('Error', error);
                        reject({ status: 500, message: 'Internal Server Error' });
                    });
                }).catch((error) => {
                    console.log('Error', error);
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    });
}


/**
 * Function For Total Collected Amount
 * @param {String} eventId 
 * @returns {totalCollection} totalCollection and reason why failed
 */
function fnGetTotalDonationAmount(eventId) {
    return new Promise((resolve, reject) => {
        TransactionModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    grandTotal: {
                        $sum: '$donation'
                    }
                }
            }
        ]).exec(function (err, transaction) {
            if (err) {
                reject(err);
            } else {
                console.log('Transaction:', transaction);
                if (transaction == '') {
                    resolve(0);
                } else {
                    resolve(transaction[0].grandTotal)
                }
            }
        });
    });
}

/**
 * Add Bank Detail To Particular Event
 * @param {object} body - Bank Detail Object
 * @returns {Promise} - Bank Detail or reason why failed
 */
const bankDetailInsideEvent = (bankData) => {
    console.log("bankData:", bankData);
    const bankDetail = {
        bankAccount: {
            accountNumber: bankData.accountNumber,
            bankName: bankData.bankName,
            ifscCode: bankData.ifscCode
        }
    }
    console.log("Bank Detail", bankDetail);
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: bankData.eventId }, bankDetail, (bankErr, bankDetail) => {
            if (bankErr) {
                console.log('bankErr Creation Error: ', bankErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Bank Added to Event Successfully.', data: bankDetail });
            }
        });
    });
}

// This Function Check Message Date Is Equal To System Date Or Not
const checkForEmailDateAndTime = () => {
    return new Promise((resolve, reject) => {
        const currentDate = moment().format('YYYY-MM-DD');
        console.log('Current Date', currentDate);
        EventModel.aggregate([
            {

                $match: {
                    $and: [
                        { 'afterEventMessage.messageDate': currentDate },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    eventId: '$_id',
                    messagePreference: '$afterEventMessage.messagePreference'
                }
            }
        ]).exec(function (err, eventList) {
            if (err) {
                reject(err);
            } else {
                console.log('Event List', eventList);
                async.eachSeries(eventList, (singleEvent, callback) => {
                    console.log('Single singleEventList', singleEvent);
                    guestListBasedOnPreference(singleEvent.eventId, singleEvent.messagePreference).then((response) => {
                        callback();
                    }).catch((error) => {
                        console.log('hey error comes', error);
                        callback();
                    });
                });
            }
        });
    });
}

/**
 * Find Guest List Based On EventId and And Message Preference
 * @param {String} eventId 
 * @param {String} messagePreference 
 */
const guestListBasedOnPreference = (eventId, messagePreference) => {
    return new Promise((resolve, reject) => {
        const emailArray = [];
        if (messagePreference == 'allGuest') {
            eventDetailWithActivity(eventId).then((response) => {
                _.forEach(response.data.guestDetail, (singleUser) => {
                    emailArray.push(singleUser.email)
                })
                eventAfterMessage(eventId).then((response) => {
                    console.log('Response From:', response);
                    const message = response.message;
                    cronJobForSendEmailToGuest(emailArray, message).then((response) => {
                        resolve(true);
                    }).catch((err) => {
                        reject(false);
                    })
                }).catch((err) => {
                    console.log('Internal Server Error', err);
                })

            }).catch((err) => {
                console.log('Internal Server Error', err);
            })
        } else if (messagePreference == 'onlyPaidGuest') {
            eventDetailWithActivity(eventId).then((response) => {
                const message = response.data
                _.forEach(response.data.guestListWithPayment, (singleUser) => {
                    emailArray.push(singleUser.email)
                })
                eventAfterMessage(eventId).then((response) => {
                    console.log('Response From:', response);
                    const message = response.message;
                    cronJobForSendEmailToGuest(emailArray, message).then((response) => {
                        resolve(true);
                    }).catch((err) => {
                        reject(false);
                    })
                }).catch((err) => {
                    console.log('Internal Server Error', err);
                })
            }).catch((err) => {
                console.log('Internal Server Error', err);
            })
        } else {
            console.log('Internal Server Error', err);
        }
    });
}



const eventAfterMessage = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            {
                $match: { '_id': ObjectId(eventId) }
            },
            {
                $project: {
                    afterEventMessage: '$afterEventMessage'
                }
            },
        ]).exec(function (eventDetailError, eventDetail) {
            if (eventDetailError) {
                reject(eventDetailError);
            } else {
                resolve(eventDetail);
            }
        });
    })
}

/**
 * Send Mail To Provided Email Array Of Particular User
 * @param {Array} emailArray 
 */
const cronJobForSendEmailToGuest = (emailArray, message) => {
    return new Promise((resolve, reject) => {
        async.eachSeries(emailArray, (singleEmail, callback) => {
            sendInvitationEmail(singleEmail, message).then((response) => {
                console.log('email sent Successfully:');
                callback();
            }).catch((error) => {
                console.log('hey error comes', error);
                callback();
            });
        }, (callbackError, callbackResponse) => {
            if (callbackError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'email Send For First Event.' });
            }
        });
    });
}

/**
 *Sending Mail Using Mail Service For Single Email
 * @param {String} email 
 * @returns {Promise} Successfully Send Or Reason Why Failed
 */
const sendInvitationEmail = (email, message) => {
    return new Promise((resolve, reject) => {

        const defaultPasswordEmailoptions = {
            to: email,
            subject: 'Thank You For Your Presence',
            template: 'afterevent-message'
        };

        mailService.mail(defaultPasswordEmailoptions, message, null, function (err, mailResult) {
            if (err) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'ResetPassword Link Send in Email' });
            }
        });
    });
}


/**
 * Scheduled Message For After Event Message
 * @param {object} body - message data to add new message
 * @returns {Promise} - New Message or reason why failed
 */
const afterEventMessageDetail = (messageData) => {

    return new Promise((resolve, reject) => {

        const newmessage = {
            afterEventMessage: {
                message: messageData.message,
                messageDate: moment(messageData.messageDate).format('YYYY-MM-DD'),
                messagePreference: messageData.messagePreference,
            }
        }

        EventModel.findByIdAndUpdate({ _id: messageData.eventId }, newmessage, { upsert: true }, (messageError, newMessage) => {
            if (messageError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'After Event Message Created Successfully.' });
            }
        });
    });
}

/**
 * Attach User Acc Detail To Particular Event
 * @param {String} eventId 
 * @param {String} accountId 
 * @param {String} paymentType 
 */
const addBankAccountDetailToEvent = (eventId, accountId, paymentType) => {
    return new Promise((resolve, reject) => {

        const bankData = {
            bankAccount: {
                accountId: accountId,
                paymentType: paymentType,
            }
        }

        EventModel.findOneAndUpdate(({ _id: eventId }, bankData)).exec((error, response) => {
            if (error) {
                console.log('error:', error);
                reject({ status: 500, message: 'Internal Server Error' });

            } else {
                resolve({ status: 200, message: 'Account Added Successfully.' });
            }
        });
    });
}


const thanksMessageList = (eventId) => {
    console.log("Event Id:", eventId);
    return new Promise((resolve, reject) => {
        EventModel.aggregate([
            // Match Of EventId In Event Model
            {
                $match: { '_id': ObjectId(eventId) }
            },
            // Reduce To Limited Data Using Project
            {
                $project: {
                    hashTag: '$hashTag',
                    thanksMessage: '$thanksMessage'
                }
            },
        ]).exec(function (msgError, msgList) {
            if (msgError) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                resolve({ status: 200, message: 'Message List Fetch Successfully.', data: msgList[0] });
            }
        });
    });
}

/**
 * Transaction Model approach For Collection Details
 * @param {String} eventId 
 * @returns {Promise} Collection Detail Acording Group Of Particular Event
 */
const activityCollection = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('EventId In Group Wise Collection', eventId);
        TransactionModel.aggregate([
            // $match Using EventId
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            // $unwind Item Array For Lookup
            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Group Model For GroupDetail
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$item.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            // $unwind GroupDetail Array For Lookup Operation
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Event Model For Activity Detail
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            // $unwind Array Of Activity Inside Item Inside GroupDetail
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $project for Limit The Data
            {
                $project: {
                    itemQuantity: '$item.quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    activityId: '$GroupDetail.item.activity.activities._id',
                    groupName: '$GroupDetail.groupName',
                    groupId: '$GroupDetail._id',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id',
                }
            },
            // $project for Limit The Data Using Project And Make Object Of Item
            {
                $project:
                {
                    activityId: 1,
                    activityName: 1,
                    item: {
                        itemId: '$itemId',
                        itemName: '$itemName',
                        groupId: '$groupId',
                        groupName: '$groupName',
                        itemPrice: '$itemPrice',
                        itemQuantity: '$itemQuantity',
                        itemType: '$itemQuantity',
                        itemGender: '$itemGender',
                        total: { $multiply: ["$itemPrice", "$itemQuantity"] },
                    },
                }
            },
            // $group Using ActivityName and GroupName
            {
                $group: {
                    _id: { activityName: '$activityName' },
                    total: {
                        $sum: '$item.total'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    activityName: '$_id.activityName',
                    total: '$total'
                }
            }
        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventListError });
            } else {
                resolve({ status: 200, message: 'Collected Amount Detail!', data: eventList });
            }
        });
    })
}

/**
 * Function With Transaction With User Detail Of Particular Event
 * @param {String} eventId 
 */
const eventTransactionUserDetail = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('EventId In Group Wise Collection', eventId);
        TransactionModel.aggregate([
            // $match Using EventId
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            // // $unwind Item Array For Lookup
            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Group Model For GroupDetail
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$item.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            // $unwind GroupDetail Array For Lookup Operation
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Event Model For Activity Detail
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            // // $unwind Array Of Activity Inside Item Inside GroupDetail
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $project for Limit The Data
            {
                $project: {
                    userId: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    itemQuantity: '$item.quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    activityId: '$GroupDetail.item.activity.activities._id',
                    groupName: '$GroupDetail.groupName',
                    groupId: '$GroupDetail._id',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id',
                }
            },
            // // $project for Limit The Data Using Project And Make Object Of Item
            {
                $project:
                {
                    activityId: 1,
                    activityName: 1,
                    userId: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    item: {
                        activityName: '$activityName',
                        activityId: '$activityId',
                        itemId: '$itemId',
                        itemName: '$itemName',
                        groupId: '$groupId',
                        groupName: '$groupName',
                        itemPrice: '$itemPrice',
                        itemQuantity: '$itemQuantity',
                        itemGender: '$itemGender',
                        total: { $multiply: ["$itemPrice", "$itemQuantity"] },
                    },
                }
            },
            {
                $group: {
                    _id: '$userId',
                    email: {
                        $first: '$email'
                    },
                    firstName: {
                        $first: '$firstName'
                    },
                    lastName: {
                        $first: '$lastName'
                    },
                    item: {
                        $push: '$item'
                    }
                }
            }

        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventListError });
            } else {
                resolve({ status: 200, message: 'Collected Amount Detail!', data: eventList });
            }
        });
    })
}


/**
 * Function With Transaction With User Detail Of Particular Event
 * @param {String} eventId 
 */
const eventWithTransactionAndUserDetail = (eventId) => {
    return new Promise((resolve, reject) => {
        console.log('EventId:', eventId);
        TransactionModel.aggregate([
            // $match Using EventId
            {
                $match: {
                    $and: [
                        { 'eventId': ObjectId(eventId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            // $unwind Item Array For Lookup
            {
                $unwind: {
                    path: '$item',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Group Model For GroupDetail
            {
                $lookup: {
                    from: 'group',
                    let: { 'itemId': '$item.itemId' },
                    pipeline: [{
                        $unwind: '$item'
                    }, {
                        $match: { $expr: { $eq: ['$item._id', '$$itemId'] } }
                    },],
                    as: 'GroupDetail'
                }
            },
            // $unwind GroupDetail Array For Lookup Operation
            {
                $unwind: {
                    path: '$GroupDetail',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $lookup In Event Model For Activity Detail
            {
                $lookup: {
                    from: 'event',
                    let: { 'activityId': '$GroupDetail.activityId' },
                    pipeline: [{
                        $unwind: '$activities'
                    }, {
                        $match: { $expr: { $eq: ['$activities._id', '$$activityId'] } }
                    },],
                    as: 'GroupDetail.item.activity'
                }
            },
            // $unwind Array Of Activity Inside Item Inside GroupDetail
            {
                $unwind: {
                    path: '$GroupDetail.item.activity',
                    preserveNullAndEmptyArrays: true
                }
            },
            // $project for Limit The Data
            {
                $project: {
                    itemQuantity: '$item.quantity',
                    activityName: '$GroupDetail.item.activity.activities.activityName',
                    activityId: '$GroupDetail.item.activity.activities._id',
                    groupName: '$GroupDetail.groupName',
                    groupId: '$GroupDetail._id',
                    itemName: '$GroupDetail.item.itemName',
                    itemPrice: '$GroupDetail.item.itemPrice',
                    itemType: '$GroupDetail.item.itemType',
                    itemGender: '$GroupDetail.item.itemGender',
                    itemId: '$GroupDetail.item._id',
                }
            },
            // $project for Limit The Data Using Project And Make Object Of Item
            {
                $project:
                {
                    activityId: 1,
                    activityName: 1,
                    item: {
                        itemId: '$itemId',
                        itemName: '$itemName',
                        groupId: '$groupId',
                        groupName: '$groupName',
                        itemPrice: '$itemPrice',
                        itemQuantity: '$itemQuantity',
                        itemType: '$itemQuantity',
                        itemGender: '$itemGender',
                        total: { $multiply: ["$itemPrice", "$itemQuantity"] },
                    },
                }
            },
            // $group Using ActivityName and GroupName
            {
                $group: {
                    _id: { activityName: '$activityName', groupName: '$item.groupName', itemName: '$item.itemName' },
                    itemQuantity: {
                        $sum: '$item.itemQuantity'
                    },
                    itemPrice: {
                        $first: '$item.itemPrice'
                    },
                    itemTotal: {
                        $sum: '$item.total'
                    },
                    itemGender: {
                        $first: '$item.itemGender'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    activityName: '$_id.activityName',
                    groupName: '$_id.groupName',
                    itemName: '$_id.itemName',
                    itemQuantity: 1,
                    itemPrice: 1,
                    itemTotal: 1,
                    itemGender: 1,
                }
            }
        ]).exec(function (eventListError, eventList) {
            if (eventListError) {
                reject({ status: 500, message: 'Internal Server Error', data: eventListError });
            } else {
                eventGuestListWithAmount(eventId).then((guestList) => {
                    onlyEventDetail(eventId).then((eventDetail) => {
                        const eventData = {};
                        eventData.guestList = guestList.data;
                        eventData.eventDetail = eventDetail;
                        eventData.eventList = eventList;
                        resolve({ status: 200, message: 'Collected Amount Detail!', data: eventData });
                    }).catch((error) => {
                        console.log('Error:', error);
                        reject({ status: 500, message: 'Internal Server Error' });
                    })
                }).catch((error) => {
                    console.log('Error:', error);
                    reject({ status: 500, message: 'Internal Server Error' });
                })
            }
        });
    })
}

/**
 * @param {EventId} eventId 
 * @param {EventDetails} eventDetails 
 * Change profile photo of event
 */
const changeProfileOfevent = (eventId, eventDetails) => {
    console.log("details of photo============", eventDetails, eventId)
    return new Promise((resolve, reject) => {
        EventModel.findOneAndUpdate({ _id: eventId },
            { $set: { profilePhoto: eventDetails.profilePhoto } },
            { upsert: true, new: true })
            // )
            .exec((error, photoUpdate) => {
                if (error)
                    //  console.log("error while update profile photo", error)
                    reject({ status: 500, message: 'Error while update profile photo of event' })
                else {
                    console.log("profile photo update", photoUpdate)
                    let updatePhoto = {
                        eventTitle: photoUpdate.eventTitle,
                        profile: photoUpdate.profilePhoto
                    }
                    resolve({ data: updatePhoto, message: photoUpdate.eventTitle + +"Profile update successfully" })
                }
            })
    })
}


/**
 * @param {Details of set price of event} details 
 * Set deadlineDate, account etc in this details
 */
function setPriceOfEvent(details) {
    return new Promise((resolve, reject) => {
        console.log("details of set price", details)
        EventModel.findByIdAndUpdate({ _id: details.eventId }, { $set: details }, { upsert: true, new: true })
            .exec((error, setPriceInEvent) => {
                if (error)
                    //  console.log("error while set price", error)
                    reject({ status: 500, message: 'Error while set price in event' })
                else {
                    console.log("set price in single event completed", setPriceInEvent)
                    resolve({ message: 'Set price stored in event' })
                }
            })
    })
}


function updateSetPrice(details) {
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: details.eventId }, { $set: details }, { upsert: true, new: true })
            .exec((error, updateDetails) => {

                if (error) reject({ status: 500, message: 'Error while update set price details' })
                else resolve({ message: 'Set price details updated' })
                console.log("details update completed", updateDetails)
            })
    })
}


function getPriceOfEvent(eventId) {
    return new Promise((resolve, reject) => {
        console.log("event id", eventId)
        EventModel.findById({ _id: eventId })
            .exec((error, priceDetails) => {
                if (error)
                    // console.log("error while get event details", error)
                    reject({ status: 500, message: 'Error while get price of event' })
                else {
                    console.log("event details", priceDetails)
                    resolve(priceDetails)
                }
            })
    })
}


function getAfterEventMessage(eventId) {
    return new Promise((resolve, reject) => {
        EventModel.findOne({ _id: eventId })
            // .populate('afterEventMessage')
            .exec((error, message) => {
                if (error)
                    //  console.log("error while get message", error)
                    reject({ status: 500, message: 'Error while get afterEventMessage' })
                else {
                    console.log("after event message", message)
                    resolve(message.afterEventMessage)
                }
            })
    })
}


function addInvitationMessage(data) {
    return new Promise((resolve, reject) => {
        console.log("details of message")
        EventModel.findByIdAndUpdate({ _id: data.eventId }, { invitationMessage: data.invitationMessage }, { upsert: true, new: true })
            .exec((error, messageAdded) => {
                if (error)
                    // console.log("error ============", error)
                    reject({ status: 500, message: 'Error while set invitation message' })
                else
                    // console.log("message added", messageAdded)
                    resolve(messageAdded)
            })
    })
}

function setReminderMessage(data) {
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: data.eventId }, { reminderDetails: data }, { upsert: true, new: true })
            .exec((error, reminderSet) => {
                if (error)
                    reject({ status: 500, message: 'Error while set reminder message' })
                // console.log("errror while set reminder", error)
                else
                    // console.log("reminder detalils set", reminderSet)
                    resolve({ message: 'Reminder set' })
            })
    })
}


function updateReminderDetails(reminderDetails) {
    console.log("reminderDetails", reminderDetails)
    return new Promise((resolve, reject) => {
        EventModel.findOneAndUpdate({ _id: reminderDetails.eventId }, { reminderDetails: reminderDetails }, { upsert: true, new: true })
            .exec((error, updateReminder) => {
                if (error)
                    // console.log("error while update", error)
                    reject({ status: 500, message: 'Error while update reminder deatils' })
                else
                    // console.log("reminder details update", updateReminder)
                    resolve({ message: 'Update reminder details' })
            })
    })
}


function setAfterEventMessage(details) {
    return new Promise((resolve, reject) => {
        EventModel.findByIdAndUpdate({ _id: details.eventId }, { afterEventMessageDetails: details }, { upsert: true, new: true })
            .exec((error, afterMessgae) => {
                if (error)
                    reject({ status: 500, message: 'Error while set after Event Message' })
                else
                    resolve({ message: 'After event message set' })
            })
    })
}


module.exports.setAfterEventMessage = setAfterEventMessage
module.exports.updateReminderDetails = updateReminderDetails
module.exports.setReminderMessage = setReminderMessage
module.exports.addInvitationMessage = addInvitationMessage
module.exports.updateSetPrice = updateSetPrice
module.exports.getPriceOfEvent = getPriceOfEvent
module.exports.activityDetailsOfEvent = activityDetailsOfEvent
module.exports.totalCollectionActivityWise = totalCollectionActivityWise
module.exports.getAfterEventMessage = getAfterEventMessage
module.exports.setPriceOfEvent = setPriceOfEvent
module.exports.getAccountDetails = getAccountDetails
module.exports.addAccountDetails = addAccountDetails
module.exports.getTotalOfCart = getTotalOfCart
module.exports.getDonation = getDonation
module.exports.addDonation = addDonation
module.exports.findEventIdWithHashtag = findEventIdWithHashtag
module.exports.guestEventDetail = guestEventDetail
module.exports.changeProfileOfevent = changeProfileOfevent
module.exports.eventWithTransactionAndUserDetail = eventWithTransactionAndUserDetail;
module.exports.activityCollection = activityCollection;
module.exports.deleteItemFromGroup = deleteItemFromGroup;
module.exports.eventDetail = eventDetail;
module.exports.cartItemList = cartItemList;
module.exports.eventGuestList = eventGuestList;
module.exports.thanksMessageList = thanksMessageList;
module.exports.eventDonationDetail = eventDonationDetail;
module.exports.findEmailUsingUserId = findEmailUsingUserId;
// module.exports.eventListForHomepage = eventListForHomepage;
module.exports.bankDetailInsideEvent = bankDetailInsideEvent;
module.exports.activityWiseCollection = activityWiseCollection;
module.exports.clearCartAfterCheckout = clearCartAfterCheckout;
module.exports.afterEventMessageDetail = afterEventMessageDetail;
module.exports.eventDetailWithActivity = eventDetailWithActivity;
module.exports.eventGuestListWithAmount = eventGuestListWithAmount;
module.exports.checkForEmailDateAndTime = checkForEmailDateAndTime;
module.exports.cronJobForSendEmailToGuest = cronJobForSendEmailToGuest;
module.exports.addBankAccountDetailToEvent = addBankAccountDetailToEvent;
module.exports.MyEventListTotalTransaction = MyEventListTotalTransaction;

