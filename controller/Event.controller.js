// npm  modules

const _ = require("lodash");

// services
const eventService = require("../services/event.service");
const paymentService = require("../services/payment.service");

// Create New Event Password API
/**
 * @api {post} /api/newevent
 */
module.exports.createNewEvent = (req, res) => {

	console.log("-------------FILES------------", req.files);
	console.log("-------------USER-------------", req.user.userres);
	console.log("-------------BODY-------------", req.body);

	let loginUser = req.user
	let finalId
	// const loginUserId= loginUser.user._id
	// const faceBookId = loginUser.userres._id
	// const googleId = loginUser.userres._id
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}


	let hashTag = req.body.hashTag.split(' ').join('_');
	let newEvent = {
		userId: finalId,
		eventType: req.body.eventType,
		eventTitle: req.body.eventTitle,
		eventTheme: req.body.background,
		// startDate: req.body.startDate,
		// endDate: req.body.endDate,
		hashTag: hashTag,
		// isPublic: req.body.isPublic,
		// paymentDeadlineDate: req.body.deadlineDate,
		// isLogistics: req.body.isLogistics,
		// defaultImage: req.body.defaultImage,
		thanksMessage: {
			attachment: '',
			message: ''
		}
	}

	// if (req.files.background) {
	// 	newEvent.eventTheme = req.files.background[0].path;
	// }

	if (req.files.profile) {
		newEvent.profilePhoto = req.files.profile[0].path;
	} else {
		return res.status(error.status ? error.status : 500).json({ message: 'Profile Photo is Required' });
	}
	console.log("when add photo with event", newEvent)
	eventService.createNewEvent(newEvent).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}



module.exports.getAfterEventMessage = (req, res) => {
	console.log("eventId", req.params.id)
	const eventId = req.params.id
	eventService.getAfterEventMessage(eventId).then((response) => {
		console.log("response of after event message", response)
		return res.status(200).json(response)
	}).catch((error) => {
		console.log("error while get thank you message details", error)
		return res.status(error.status).json({ message: error.message })
	})
}


/**
 * Change profile photo of event
 */
module.exports.changeProfile = (req, res) => {
	console.log("when profile is update", req.body, req.files)
	let newEvent = {}
	const eventId = req.body.eventId
	// if(req.body.eventId) newEvent
	if (req.files.profile) {
		newEvent.profilePhoto = req.files.profile[0].path;
	}
	eventService.changeProfileOfevent(eventId, newEvent).then((profileChange) => {
		console.log("profile photo update", profileChange)
		return res.status(200).json({ update: profileChange.data, message: profileChange.message })
	}).catch((error) => {
		console.log("error while change photo", error)
		return res.status(error.status).json({ message: error.message })
	})
	console.log("only photo update", newEvent)
}

/**
 * Set price of event 
 */
module.exports.setPriceOfEvent = (req, res) => {
	console.log("details of set price", req.body)
	let setDetails = req.body
	eventService.setPriceOfEvent(setDetails).then((response) => {
		console.log("response of set price", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while set price", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Create New Activity Inside Event API
 * @api {post} /api/newevent/activity
 */
module.exports.newActivityInsideEvent = (req, res) => {
	console.log("Activity Data", req.body);
	eventService.newActivityInsideEvent(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Create New Group Of People Inside Activity API
 * @api {post} /api/newevent/activity
 */
module.exports.newGroupInsideActivity = (req, res) => {
	console.log("New Group Request.body", req.query.eventId);

	eventService.newGroupInsideActivity(req.body, req.query.eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Event Detail Using EventId from Paramaters
 * @api {get} /api/event:id
 */
module.exports.eventDetail = (req, res) => {
	console.log("first of all su ave che", req.params)
	const eventId = req.params.id;
	const userId = req.user.user._id;
	console.log('Req.user:', userId);
	eventService.eventDetail(eventId, userId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.guestEventDetails = (req, res) => {
	console.log("guest event hashtag", req.params)
	const eventhashTag = req.params.hashTag
	const userId = req.user.user._id;
	eventService.guestEventDetail(eventhashTag, userId).then((response) => {
		console.log("response of guest link event", response)
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log("error while get details of event", error)
		return res.status(error.status).json({ message: error.message })
	})
}



/**
 * Remove Event From Using EventId
 * @api {delete} /api/event
 */
module.exports.deleteEvent = (req, res) => {
	const eventId = req.params.id;
	console.log('EventId:', eventId);
	eventService.deleteEvent(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Remove Activity From Event Using ActivityId
 * 
 */
module.exports.deleteActivityFromEvent = (req, res) => {
	const activityId = req.body.activityId;
	const eventId = req.body.eventId;
	console.log('EventID and ActivityId:', req.body);
	eventService.deleteActivityFromEvent(eventId, activityId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Remove Group From Event Using GroupId
 * @api {delete} /api/event/group/:groupId
 */
module.exports.deleteGroupFromActivity = (req, res) => {
	const groupId = req.body.groupId;
	eventService.deleteGroupFromActivity(groupId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Add ThankYou Message To Particular Event
 * @param {req.body} - Message Data
 * @returns - Thanks Message Or Reason To Fail
 */
module.exports.thanksMessageDetail = (req, res) => {

	console.log('Req.files:', req.files);

	const attachment = req.files[0].path;

	console.log('files path array:', attachment);

	const messageData = { eventId: req.body.eventId, message: req.body.message, attachment: attachment }

	eventService.thanksMessageDetail(messageData).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Update Existing Event Using EventId
 * @param {req.body} - Message Data
 * @returns - Thanks Message Or Reason To Fail
 */
module.exports.updateExistingEvent = (req, res) => {

	console.log('Req.body', req.body);

	const eventId = req.body.eventId;
	let hashTag = req.body.hashTag.split(' ').join('_');

	let eventData = {};

	if (req.user.user._id) eventData['userId'] = req.user.user._id;
	if (req.body.eventType) eventData['eventType'] = req.body.eventType;
	if (req.body.eventTitle) eventData['eventTitle'] = req.body.eventTitle;
	if (req.body.hashTag) eventData['hashTag'] = hashTag;
	if (req.body.isPublic) eventData['isPublic'] = req.body.isPublic;
	if (req.body.deadlineDate) eventData['paymentDeadlineDate'] = req.body.deadlineDate;
	if (req.body.isLogistics) eventData['isLogistics'] = req.body.isLogistics;

	if (req.files.profile) {
		eventData.profilePhoto = req.files.profile[0].path;
	}

	if (req.files.background) {
		eventData.eventTheme = req.files.background[0].path;
	}

	eventService.updateExistingEvent(eventId, eventData).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * List Of All Public Event 
 * @returns - List Of Public Event Or Reason To Fail
 */
module.exports.eventList = (req, res) => {
	eventService.eventList().then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Update Activity Inside Event
 * @param {req.body} - Activity Data
 * @returns - Updated Activity Or Reason To Fail
 */
module.exports.updateActivityInsideEvent = (req, res) => {
	eventService.updateActivityInsideEvent(req.body.activity).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Update Group Inside Activity
 * @param {req.body} - Group Data To Update
 * @returns - Updated Group Or Reason To Fail
 */
module.exports.updateGroupInsideActivity = (req, res) => {
	// console.log("req.body", JSON.stringify(req.body));
	eventService.updateGroupInsideActivity(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * MY Event List Using Specific User
 * @param {UserId} - UserID Of User
 * @returns - MyEventList Or Reason To Fail
 */
module.exports.MyEventList = (req, res) => {
	const userId = req.user.user._id;
	eventService.MyEventList(userId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Add Item To Cart
 * @param {req.body} - Item Data
 * @returns - Item Of Cart Or Reason To Fail
 */
module.exports.addItemToCart = (req, res) => {
	console.log("all items list", req.body)
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	let itemData = []
	itemData = req.body
	let hashTag = itemData[0]
	console.log("event hastag", hashTag.eventHashtag)
	eventService.addItemToCart(itemData, hashTag, finalId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Update Existing Cart Item
 * @param {req.body} - Cart Data To Updated
 * @returns - Updated Item Or Reason To Fail
 */
module.exports.updateItemToCart = (req, res) => {
	console.log('updateItemToCart', req.body);
	eventService.updateItemToCart(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Cart Item List Using UserID or EventID
 * @param {req.body} - UserID Or EventID
 * @returns - Cart Item List Or Reason To Fail
 */
module.exports.cartItemList = (req, res) => {
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	const hashTag = req.params.hashTag;
	console.log("hashtag", hashTag)
	eventService.findEventIdWithHashtag(hashTag).then((response) => {
		console.log("response of eventId", response)
		const eventId = response
		eventService.cartItemList(eventId, finalId).then((response) => {
			return res.status(200).json({ message: response.message, data: response.data });
		}).catch((error) => {
			console.error('error: ', error);
			return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
		});
	}).catch((error) => {
		console.log("error while get event id", error)
		return res.status(error.status).json({ message: error.message })
	})


}

/**
 * Remove Item From Cart Using CartId
 * @param {req.body} - CartId TO remove From Cart	
 * @returns - Deleted Item Or Reason To Fail
 */
module.exports.removeItemFromCart = (req, res) => {
	const cartId = req.query.itemId;
	console.log("CART_ITEM_ID", cartId);
	eventService.removeItemFromCart(cartId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Update Item From Cart Using CartId
 * @param {req.body} - CartId TO remove From Cart	
 * @returns - Deleted Item Or Reason To Fail
 */
module.exports.updateItemFromCart = (req, res) => {
	console.log("Final Json Object In Update", req.body);
	eventService.updateItemFromCart(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Add Donation of guest user in event
 */
module.exports.addDonation = (req, res) => {
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	let donationObj = {
		eventId: req.body.eventId,
		donation: req.body.donation,
		// userId: finalId
	}
	console.log("req of body", req.body)
	eventService.addDonation(donationObj, finalId).then((response) => {
		console.log("donation added in data base", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while add donation", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Get total donation of guest user of single event
 */
module.exports.getDonation = (req, res) => {
	console.log("event id", req.params.hashTag)
	const hashTag = req.params.hashTag
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	eventService.getDonation(finalId, hashTag).then((response) => {
		console.log("response of donation", response)
		return res.status(200).json({ data: response.data })
	}).catch((error) => {
		console.log("error while get donation details", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Get total of Cart items
 */
module.exports.getTotalOfCart = (req, res) => {
	console.log("req ========", req.params.hashTag)
	const hashTag = req.params.hashTag
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	eventService.getTotalOfCart(finalId, hashTag).then((response) => {
		console.log("response of total", response)
		return res.status(200).json({ data: response })
	}).catch((error) => {
		console.log("error while get total of cart", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Add Account details of guest user
 */
module.exports.addPaymentDetails = (req, res) => {
	console.log("req.body ======", req.body)
	let cartList = req.body.cartItems
	let loginUser = req.user
	let finalFlage = req.body.flag
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	let finalData = {}
	if (req.body.flag == false) {
		if (req.body.bankName) finalData['bankName'] = req.body.bankName
		if (req.body.accountNumber) finalData['accountNumber'] = req.body.accountNumber
		console.log("final data of bank", finalData)
	}
	if (req.body.flag == true) {
		if (req.body.flag) finalData['flag'] = req.body.flag
		if (req.body.cardNumber) finalData['cardNumber'] = req.body.cardNumber
		if (req.body.cvv) finalData['cvv'] = req.body.cvv
		console.log("final data of card", finalData)
	}
	eventService.addAccountDetails(finalData, finalId, finalFlage).then((response) => {
		console.log("details added completed", response)
		eventService.orderCheckout(finalId, cartList).then((paymentDone) => {
			console.log("payment compledted", paymentDone)
			return res.status(200).json({ data: paymentDone.data, message: response.message })
		}).catch((error) => {
			console.log("error while payment", error)
			return res.status(error.status).json({ message: error.message })
		})
	}).catch((error) => {
		console.log("error while add details ", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Get guest bank account details
 */
module.exports.getAccountDetails = (req, res) => {
	console.log("re================", req.query)
	const accountType = req.query.type
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	eventService.getAccountDetails(finalId, accountType).then((response) => {
		console.log("response of account", response)
		return res.status(200).json({ data: response.data })
	}).catch((error) => {
		console.log("error while get details", error)
		return res.status(error.status).json({ message: error.message })
	})
}


/**
 * Event Joining Thru Event Link
 * @param {req.body} - EventID and UserID
 * @returns - Join Successfully Or Reason To Fail
 */
module.exports.eventJoining = (req, res) => {
	// var eventId = Buffer.from(hashedData, 'base64').toString('ascii');
	const eventId = req.body.eventId;
	console.log("Request.body in controller", req.body);
	const userId = req.user.user._id;
	console.log("REQUEST.USER", userId);
	console.log("EVENT ID", eventId);
	eventService.eventJoining(userId, eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 400).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Cart Item List Using UserID or EventID
 * @param {req.body} - UserID Or EventID
 * @returns - Cart Item List Or Reason To Fail
 */
module.exports.cartItemListWithTotal = (req, res) => {
	const eventId = req.params.id;
	const userId = req.user.user._id;
	console.log('Event Id', eventId);
	console.log('User Id', userId);
	eventService.cartItemListWithTotal(eventId, userId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Cart Item List Using UserID or EventID
 * @param {req.body} - UserID Or EventID
 * @returns - Cart Item List Or Reason To Fail
 */
module.exports.orderCheckout = (req, res) => {

	console.log("body of cart with total", req.body)

	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}

	// console.log('User Id', userId);

	eventService.orderCheckout(finalId, req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Cart Item List Using UserID or EventID
 * @param {req.body} - UserID Or EventID
 * @returns - Cart Item List Or Reason To Fail
 */
module.exports.eventDetailWithActivity = (req, res) => {
	const eventId = req.params.id;
	console.log("Event Id in controller", eventId);
	eventService.eventDetailWithActivity(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Total Counts For AdminDashboard
 * @param {req.body} - UserID Or EventID
 * @returns - Cart Item List Or Reason To Fail
 */
module.exports.getCountForAdminDashboard = (req, res) => {
	eventService.getCountForAdminDashboard().then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * GroupWise Sold Item Collections
 * @param {req.body} - EventID
 * @returns - GroupWise Item List Or Reason To Fail
 */
module.exports.groupWiseItemCollection = (req, res) => {
	const eventId = req.params.id;
	console.log('EventId:', eventId);
	eventService.groupWiseItemCollection(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Searching Event Using Hashtags
 * @param {req.body} - Search Text
 * @returns - Event List Or Reason To Fail
 */
module.exports.eventListUsingHashTag = (req, res) => {
	const keyword = req.query.keyword;
	console.log('Search Keyword:', keyword);
	eventService.eventListUsingHashTag(keyword).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Event List For HomePage(Only Public Event)
 * @param {req.body} - Search Text
 * @returns - Event List Or Reason To Fail
 */
module.exports.eventListForHomepage = (req, res) => {
	const keyword = req.query.keyword;
	eventService.eventListForHomepage(keyword).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.finalPayment = (req, res) => {
	console.log('Inside final payment Function');
	paymentService.initiatePayment();
}

module.exports.addEventType = (req, res) => {
	const keyword = req.query.keyword;
	eventService.addEventType(keyword).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.activityWiseCollection = (req, res) => {
	console.log("event id", req.query)
	const eventId = req.query.eventId;
	console.log('EventId', eventId);
	eventService.activityWiseCollection(eventId).then((response) => {
		console.log("response of data", response)
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.eventDonationDetail = (req, res) => {
	const eventId = req.query.eventId;
	console.log('EventId', eventId);
	eventService.eventDonationDetail(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.eventGuestList = (req, res) => {
	const eventId = req.query.eventId;
	console.log('EventId', eventId);
	eventService.eventGuestList(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.bankDetailInsideEvent = (req, res) => {
	console.log('Request Body', req.body);
	eventService.bankDetailInsideEvent(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.afterEventMessageDetail = (req, res) => {
	console.log('Request Body', req.body);
	eventService.afterEventMessageDetail(req.body).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.eventGuestListWithAmount = (req, res) => {
	const eventId = req.query.eventId;
	console.log('EventId:', eventId);
	eventService.eventGuestListWithAmount(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

module.exports.checkForEmailDateAndTime = (req, res) => {
	console.log('Function is calling');
	eventService.checkForEmailDateAndTime();
}

module.exports.addBankAccountDetailToEvent = (req, res) => {

	const eventId = req.body.eventId;
	const accountId = req.body.accountId;
	const paymentType = req.body.paymentType;

	console.log('Detail In Controller:', eventId, accountId, paymentType);

	eventService.addBankAccountDetailToEvent(eventId, accountId, paymentType).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error:', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	})
}

module.exports.thanksMessageList = (req, res) => {

	const eventId = req.params.id;

	console.log('Detail In Controller:', eventId);

	eventService.thanksMessageList(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error:', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	})
}

module.exports.deleteItemFromGroup = (req, res) => {

	console.log('Detail In Controller:', req.body);

	const groupId = req.body.groupId;
	const itemId = req.body.itemId;

	eventService.deleteItemFromGroup(groupId, itemId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error:', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	})
}

module.exports.MyEventListTotalTransaction = (req, res) => {
	const userId = req.user.user._id;
	eventService.MyEventListTotalTransaction(userId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error:', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	})
}

module.exports.eventWithTransactionAndUserDetail = (req, res) => {
	const eventId = req.query.eventId;

	console.log('EventId:', eventId);

	eventService.eventWithTransactionAndUserDetail(eventId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error:', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	})
}









