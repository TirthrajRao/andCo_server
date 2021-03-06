// npm  modules

const _ = require("lodash");

// services
const eventService = require("../services/event.service");
const paymentService = require("../services/payment.service");
const pdfService = require("../services/pdf.service");
const config = require("../configNew");


// Create New Event Password API
/**
 * @api {post} /api/newevent
 */
module.exports.createNewEvent = (req, res) => {

	// console.log("-------------FILES------------", req.files);
	// console.log("-------------USER-------------", req.user.userres);
	// console.log("-------------BODY-------------", req.body.background);
	let newBackGround = req.body.background.split('/')
	let test1 = newBackGround[2].split('-')
	console.log("new background image set", test1)

	let finalBackGround = newBackGround[0] + '/' + newBackGround[1] + '/' + test1[0] + '.png'
	console.log("this is the final background to save", finalBackGround)
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
		eventTheme: finalBackGround,
		hashTag: hashTag,
	}

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


module.exports.addAttachmentInAfterMessage = (req, res) => {


	let eventData = {};
	if (req.body.eventId) eventData['eventId'] = req.body.eventId
	if (req.files.profile) {
		eventData.attachment = req.files.profile[0].path;
	}
	eventService.setAttachmentInAfterMessage(eventData).then((response) => {
		console.log("attachment store in details", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while store attachment", error)
	})
	// if (details.afterEventMessage) eventData['afterEventMessage'] = details.afterEventMessage;

}


module.exports.checkHashtag = (req, res) => {

	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	let data = req.body
	console.log("hashtag========", data)
	eventService.fnHashtagAvailable(data, finalId).then((response) => {
		console.log("response of hashtag is or not", response)
		return res.status(200).json({ data: response })
	}).catch((error) => {
		console.log("error while if it is", error)
		return res.status(error.status).json({ message: error.message })
	})
}


/**
 * Set price of event 
 */
module.exports.setPriceOfEvent = (req, res) => {
	// console.log("details of set price", req.body)

	let setDetails = req.body
	if (setDetails.bankDetails.flag == 'bank') {
		console.log("call this")
		let bankAccount = {
			_id: setDetails.bankDetails._id
		}
		setDetails['bankAccount'] = bankAccount
	}
	if (setDetails.bankDetails.flag == 'card') {
		console.log("call this")
		let cardAccount = {
			_id: setDetails.bankDetails._id
		}
		setDetails['cardAccount'] = cardAccount
	}
	if (!setDetails.timeZoneSelect) {
		console.log("when time is normal")
		setDetails['timeZoneSelect'] = req.body.defaultTime
	}
	console.log("details of final ", setDetails)
	eventService.setPriceOfEvent(setDetails).then((response) => {
		console.log("response of set price", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while set price", error)
		return res.status(error.status).json({ message: error.message })
	})
}


module.exports.updateSetPriceOfEvent = (req, res) => {
	console.log("details of update set price", req.body)
	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	let bankAccount
	let cardAccount
	if (req.body.bankDetails.flag == 'bank') {
		console.log("call this")

		bankAccount = {
			_id: req.body.bankDetails._id
		}
		// req.body['bankAccount'] = bankAccount
	}
	if (req.body.bankDetails.flag == 'card') {
		console.log("call this")
		cardAccount = {
			_id: req.body.bankDetails._id
		}
		// req.body['cardAccount'] = cardAccount
	}

	let updateDetails = {}
	if (req.body.thanksMessage) updateDetails['thanksMessage'] = req.body.thanksMessage
	if (req.body.afterEventMessage) updateDetails['afterEventMessage'] = req.body.afterEventMessage
	if (req.body.paymentDeadlineDate) updateDetails['paymentDeadlineDate'] = req.body.paymentDeadlineDate
	if (req.body.paymentDeadlineTime) updateDetails['paymentDeadlineTime'] = req.body.paymentDeadlineTime
	if (req.body.bankDetails) updateDetails['bankDetails'] = req.body.bankDetails
	if (req.body.eventId) updateDetails['eventId'] = req.body.eventId
	if (req.body.hearAbout) updateDetails['hearAbout'] = req.body.hearAbout
	if (req.body.payMentTransferDate) updateDetails['payMentTransferDate'] = req.body.payMentTransferDate
	if (req.body.isLogistics) updateDetails['isLogistics'] = req.body.isLogistics
	if (req.body.regestery) updateDetails['regestery'] = req.body.regestery
	if (req.body.linkOfEvent) updateDetails['linkOfEvent'] = req.body.linkOfEvent
	if (req.body.timeZoneSelect) updateDetails['timeZoneSelect'] = req.body.timeZoneSelect
	if (req.body.bankDetails.flag == 'bank') updateDetails['bankAccount'] = bankAccount
	if (req.body.bankDetails.flag == 'card') updateDetails['cardAccount'] = cardAccount
	console.log("update", updateDetails)
	eventService.updateSetPrice(updateDetails).then((updated) => {
		console.log("update completed", updated)
		return res.status(200).json({ message: updated.message })
	}).catch((error) => {
		console.log("error while update", error)
		return res.status(error.status).json({ message: error.message })
	})
}

/**
 * Get set price of single event
 */
module.exports.getPriceOfEvent = (req, res) => {
	let eventId = req.params.id
	console.log("event id ==========", eventId)
	eventService.getPriceOfEvent(eventId).then((response) => {
		console.log("response of event", response)
		return res.status(200).json(response)
	}).catch((error) => {
		console.log("error while get price", error)
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
	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	eventService.eventDetail(eventId, finalId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}


module.exports.activityDetailsOfEvent = (req, res) => {
	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	const eventId = req.params.id;
	eventService.activityDetailsOfEvent(eventId, finalId).then((response) => {
		console.log("response of activity", response)
		return res.status(200).json({ data: response, message: response.message })
	}).catch((error) => {
		console.log("error while get activity", error)
		return res.status(error.status).json({ message: error.message })
	})

}


module.exports.guestEventDetails = (req, res) => {
	console.log("guest event hashtag", req.params)
	const eventhashTag = req.params.hashTag
	// let loginUser = req.user
	// let finalId
	// if (loginUser.user) {
	// 	finalId = loginUser.user._id
	// } else if (loginUser.userres) {
	// 	finalId = loginUser.userres._id
	// }
	// const userId = req.user.user._id;

	// eventService.guestEventDetail(eventhashTag).then((response) => {
	// 	// console.log("response of guest link event", response)
	// 	return res.status(200).json({ message: response.message, data: response.data });
	// }).catch((error) => {
	// 	console.log("error while get details of event", error)
	// 	return res.status(error.status).json({ message: error.message })
	// })


	eventService.checkCaseSensitive(eventhashTag).then((response) => {
		console.log("response of event which is want", response)
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.log("error while get details", error)
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
	console.log("details of remove group", req.body)
	const groupId = req.body._id;
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

	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	const eventId = req.body.eventId;
	let hashTag = req.body.hashTag.split(' ').join('_');
	if (req.body.background) {
		let newBackGround = req.body.background.split('/')
		let test1 = newBackGround[2].split('-')
		// console.log("new background image set", test1)

		let finalBackGround = newBackGround[0] + '/' + newBackGround[1] + '/' + test1[0] + '.png'
		console.log("this is the final background to save", finalBackGround)
	}

	let eventData = {};

	if (req.user) eventData['userId'] = finalId;
	if (req.body.eventType) eventData['eventType'] = req.body.eventType;
	if (req.body.eventTitle) eventData['eventTitle'] = req.body.eventTitle;
	if (req.body.hashTag) eventData['hashTag'] = hashTag;
	if (req.body.background) eventData['eventTheme'] = finalBackGround
	// if (req.body.isPublic) eventData['isPublic'] = req.body.isPublic;
	// if (req.body.deadlineDate) eventData['paymentDeadlineDate'] = req.body.deadlineDate;
	// if (req.body.isLogistics) eventData['isLogistics'] = req.body.isLogistics;

	if (req.files.profile) {
		eventData.profilePhoto = req.files.profile[0].path;
	}
	console.log("event update data", eventData)

	// if (req.files.background) {
	// 	eventData.eventTheme = req.files.background[0].path;
	// }

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
	console.log("activity details", req.body)
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
		console.log("update group", response)
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
	// const userId = req.user.user._id;
	let loginUser = req.user
	console.log("login user of social", loginUser)
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	console.log("final id", finalId)
	eventService.MyEventList(finalId).then((response) => {
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


module.exports.getItems = (req, res) => {
	let check = JSON.parse(req.params.data)
	let allitems = check.allItems
	console.log("what is the value", allitems)
	eventService.getCartItems(check.eventId, allitems).then((finalItems) => {
		console.log("final items array", finalItems)
		return res.status(200).json(finalItems)
	}).catch((error) => {
		console.log("error======", error)
	})
}


/**
 * Add Account details of guest user
 */
module.exports.addPaymentDetails = (req, res) => {
	let cartList = req.body.cartItems
	let finalFlage = req.body.flag
	let guestDetails = req.body.guestDetails
	console.log("req.body ======", guestDetails)
	// let loginUser = req.user
	// if (loginUser.user) {
	// 	finalId = loginUser.user._id	
	// } else if (loginUser.userres) {
	// 	finalId = loginUser.userres._id
	// }
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
	console.log("final cart item", cartList)
	eventService.addGuestDetails(guestDetails).then((guestAdded) => {
		console.log("guest user added", guestAdded.data)
		let userId = guestAdded.data
		eventService.orderCheckout(userId, cartList).then((paymentDone) => {
			console.log("payment compledted", paymentDone)
			return res.status(200).json({ data: paymentDone.data, message: paymentDone.message })
		}).catch((error) => {
			console.log("error while payment", error)
			return res.status(error.status).json({ message: error.message })
		})
	}).catch((error) => {
		console.log("error while add guest", error)
	})

	// eventService.addAccountDetails(finalData, finalId, finalFlage).then((response) => {
	// 	console.log("details added completed", response)
	// 	eventService.orderCheckout(finalId, cartList).then((paymentDone) => {
	// 		console.log("payment compledted", paymentDone)
	// 		return res.status(200).json({ data: paymentDone.data, message: response.message })
	// 	}).catch((error) => {
	// 		console.log("error while payment", error)
	// 		return res.status(error.status).json({ message: error.message })
	// 	})
	// }).catch((error) => {
	// 	console.log("error while add details ", error)
	// 	return res.status(error.status).json({ message: error.message })
	// })
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
	const data = {}
	data.eventId = req.body.eventId
	data.platForm = req.body.platForm
	// const eventId = req.body.eventId;
	console.log("Request.body in controller", req.body);
	// const userId = req.user.user._id;
	let loginUser = req.user
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	// console.log("EVENT ID", eventId);
	eventService.eventJoining(finalId, data).then((response) => {
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

/**
 * After event message send to guestList
 */
module.exports.checkForEmailDateAndTime = (req, res) => {
	console.log('Function is calling');
	eventService.checkForEmailDateAndTime();
}


/**
 * Reminder message send to guestList
 */
module.exports.sendReminderMailToGuest = (req, res) => {
	eventService.sendReminderMailToGuest();
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

module.exports.addInvitationMessage = (req, res) => {
	console.log("body of message", req.body)
	let data = req.body
	eventService.addInvitationMessage(data).then((response) => {
		return res.status(200).json({ data: response })
	}).catch((error) => {
		return res.status(error.status).json({ message: error.message })
	})
}

module.exports.setWelcomeMessage = (req, res) => {
	let data = req.body
	console.log("details of welcome message", data)
	eventService.addWelcomeMessage(data).then((response) => {
		return res.status(200).json({ data: response.message })
	}).catch((error) => {
		return res.status(error.status).json({ message: error.message })
	})
}

module.exports.addPayMessage = (req, res) => {
	let data = req.body
	eventService.addPayMessage(data).then((response) => {
		return res.status(200).json({ data: response })
	}).catch((error) => {
		return res.status(error.status).json({ message: error.message })
	})
}

module.exports.setReminderMessage = (req, res) => {
	console.log("details of reminder", req.body)
	let eventData = {};

	if (req.body.reminderMessage) eventData['reminderMessage'] = req.body.reminderMessage;
	if (req.body.reminderStartDate) eventData['reminderStartDate'] = req.body.reminderStartDate;
	if (req.body.reminderStartTime) eventData['reminderStartTime'] = req.body.reminderStartTime;
	if (req.body.eventId) eventData['eventId'] = req.body.eventId
	if (req.body.guestList) eventData['guestList'] = req.body.guestList
	eventService.setReminderMessage(eventData).then((response) => {
		console.log("reminder set", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while set reminder", error)
		return res.status(error.status).json({ message: error.message })
	})
}


module.exports.updateReminderDetails = (req, res) => {
	console.log("details of update reminder ", req.body)
	let eventData = {};

	if (req.body.reminderMessage) eventData['reminderMessage'] = req.body.reminderMessage;
	if (req.body.reminderStartDate) eventData['reminderStartDate'] = req.body.reminderStartDate;
	if (req.body.reminderStartTime) eventData['reminderStartTime'] = req.body.reminderStartTime;
	if (req.body.eventId) eventData['eventId'] = req.body.eventId
	if (req.body.guestList) eventData['guestList'] = req.body.guestList
	console.log("update data is ready", eventData)
	eventService.updateReminderDetails(eventData).then((updateReminder) => {
		console.log("details update", updateReminder)
		return res.status(200).json({ message: updateReminder.message })
	}).catch((error) => {
		console.log("error while update", error)
		return res.status(error.status).json({ message: error.message })
	})
}


module.exports.setAfterEventMessage = (req, res) => {
	let details = req.body

	let eventData = {};
	if (details.eventId) eventData['eventId'] = details.eventId
	if (details.afterEventMessage) eventData['afterEventMessage'] = details.afterEventMessage;
	if (details.listOfGuest) eventData['listOfGuest'] = details.listOfGuest;
	eventData['messageDate'] = new Date()
	eventService.setAfterEventMessage(eventData).then((response) => {
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while update", error)
		return res.status(error.status).json({ message: error.message })
	})
}



module.exports.generatePdf = (req, res) => {
	let data = req.body
	console.log("details of ", data)
	let eventId = data.eventId
	let loginUser = req.user
	let finalId
	if (loginUser.user) {
		finalId = loginUser.user._id
	} else if (loginUser.userres) {
		finalId = loginUser.userres._id
	}
	console.log("final data to display", data)

	eventService.eventDetail(eventId, finalId).then((response) => {
		console.log("response of event", response)
		let eventDetail = {
			eventTitle: response.data.eventTitle,
			hashTag: response.data.hashTag,
			profilePhoto: config.ngrockUrl + response.data.profilePhoto
		}
		pdfService.pdfGenerate(data.data, eventDetail).then((response) => {
			console.log("response of data", response)
			let finalData = {
				data: response,
				hashTag: eventDetail.hashTag,
				profilePhoto: eventDetail.profilePhoto,
				// pdfUrl: 
			}
			return res.status(200).json({ data: finalData })
		}).catch((error) => {
			console.log("error while generate pdf", error)
			return res.status(error.status).json({ message: error.message })
		})
	}).catch((error) => {
		console.log("error while get details", error)
		return res.status(error.status).json({ message: error.message })
	})
}


module.exports.getAllEvents = (req, res) => {
	console.log("call thay che ke nai")
	eventService.changeLink().then((response) => {
		console.log("all database link change", response)
		return res.status(200).json({ data: response, message: response.message })
	}).catch((error) => {
		console.log("error while change link", error)
	})
}

module.exports.getAllGuestList = (req, res) => {
	eventService.updateGuestList().then((response) => {
		console.log("response of all guest list update", response)
		return res.status(200).json({ data: response, message: response.message })
	}).catch((error) => {
		console.log("error while update guest", error)
	})
}

module.exports.changeTimeLog = (req, res) => {
	eventService.changeTime().then((response) => {
		console.log("response of all guest list update", response)
		return res.status(200).json({ data: response, message: response.message })
	}).catch((error) => {
		console.log("error while update guest", error)
	})
}

module.exports.shareLinkOnGmail = (req, res) => {
	console.log("array of mail list to send link", req.body)
	let mailArray = req.body.arrayOfEmail
	let eventId = req.body.eventId
	let eventLink = req.body.eventLink
	eventService.shareLinkToGmail(mailArray, eventId, eventLink).then((response) => {
		console.log("response of mail send through to gmail", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while send mail to gmail", error)
		return res.status(error.status).json({ message: error.message })
	})
}


module.exports.sharePdfOnGmail = (req, res) => {
	console.log("data for pdf share on gmail", req.body)

	let mailArray = req.body.arrayOfEmail
	let eventId = req.body.eventId
	let pdfLink = req.body.pdfLink
	eventService.sharePdfToGmail(mailArray, eventId, pdfLink).then((response) => {
		console.log("response of mail send through to gmail", response)
		return res.status(200).json({ message: response.message })
	}).catch((error) => {
		console.log("error while send mail to gmail", error)
		return res.status(error.status).json({ message: error.message })
	})
}

