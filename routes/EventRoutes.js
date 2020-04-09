const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Controllers
const EventController = require('../controller/Event.controller');

// Middleware
const Fileupload = require('../middleware/fileupload');
const ensureAuthenticated = require('../middleware/ApiAuth');

// Validations
const eventValidation = require('../validations/EventValidations');

const cpUpload = upload.fields([{ name: 'profile', maxCount: 1 }]);


// Routes For AdminDashboard Counts
router.get('/event/admin-dashboard-count', EventController.getCountForAdminDashboard);

// Routes For Add Detail Of Auto-Message Detail
router.put('/after-eventmsg', eventValidation.afterEventMessageDetail, EventController.afterEventMessageDetail);
router.post('/event/invitation', ensureAuthenticated.validateToken, EventController.addInvitationMessage)
router.post('/event/setReminder', ensureAuthenticated.validateToken, EventController.setReminderMessage)
router.put('/event/setReminder', ensureAuthenticated.validateToken, EventController.updateReminderDetails)
// Routes For Event Joining Operations
router.post('/event/join-event', ensureAuthenticated.validateToken, EventController.eventJoining);
router.get('/event/search-hashtag', EventController.eventListUsingHashTag);
router.get('/event/public-event', EventController.eventListForHomepage);

// Routes For Cart Operations
router.get('/event/cart-list/:hashTag', ensureAuthenticated.validateToken, EventController.cartItemList);
router.get('/event/final-list/:id', ensureAuthenticated.validateToken, EventController.cartItemListWithTotal);
router.post('/event/order-checkout/', ensureAuthenticated.validateToken, EventController.orderCheckout);
router.put('/event/update-item', ensureAuthenticated.validateToken, EventController.updateItemFromCart);
router.post('/event/add-donation', ensureAuthenticated.validateToken, EventController.addDonation)
router.get('/event/getDonation/:hashTag', ensureAuthenticated.validateToken, EventController.getDonation)
router.get('/event/getTotalOfCart/:hashTag', ensureAuthenticated.validateToken, EventController.getTotalOfCart)
// router.post('/guestAccount', ensureAuthenticated.validateToken, EventController.addPaymentDetails)

router.route('/guestAccount')
    .post([ensureAuthenticated.validateToken, EventController.addPaymentDetails])
    .get(ensureAuthenticated.validateToken, EventController.getAccountDetails)

// Routes For Event Operations
router.route('/event')
    .post([ensureAuthenticated.validateToken], cpUpload, eventValidation.newEvent, EventController.createNewEvent)
    .put([ensureAuthenticated.validateToken], cpUpload, EventController.updateExistingEvent)

// Routes For Activity Operations
router.route('/activity')
    .post([ensureAuthenticated.validateToken], EventController.newActivityInsideEvent)
    .put([ensureAuthenticated.validateToken], EventController.updateActivityInsideEvent)

// Router For Delete Activity From Event
router.post('/activity-delete', ensureAuthenticated.validateToken, EventController.deleteActivityFromEvent);

// Routes For Group Operations  
router.route('/group')
    .post([ensureAuthenticated.validateToken], EventController.newGroupInsideActivity)
    .put([ensureAuthenticated.validateToken], EventController.updateGroupInsideActivity)

// Routes For Cart Operations
router.route('/cart')
    .post([ensureAuthenticated.validateToken], EventController.addItemToCart)
    .put([ensureAuthenticated.validateToken], EventController.updateItemToCart)
    .delete([ensureAuthenticated.validateToken], EventController.removeItemFromCart)

// Routes For Event Details
router.get('/event/myevent-list', ensureAuthenticated.validateToken, EventController.MyEventList);
router.get('/event/event-list', EventController.eventList);
router.get('/event/:id', [ensureAuthenticated.validateToken], EventController.eventDetail);
router.get('/event/activity/:id', [ensureAuthenticated.validateToken], EventController.activityDetailsOfEvent)
router.get('/event/guestEvent/:hashTag', [ensureAuthenticated.validateToken], EventController.guestEventDetails)

//Routes For Event Profile Change and Set price of event

router.post('/event/changeProfile', cpUpload, EventController.changeProfile)


router.route('/event/set-price')
    .post([ensureAuthenticated.validateToken], EventController.setPriceOfEvent)
    .put([ensureAuthenticated.validateToken], EventController.updateSetPriceOfEvent)

router.post('/event/setAfterEventMessage', ensureAuthenticated.validateToken, EventController.setAfterEventMessage)

// router.post('/event/set-price', ensureAuthenticated.validateToken, EventController.setPriceOfEvent)
router.get('/event/set-price/:id', ensureAuthenticated.validateToken, EventController.getPriceOfEvent)

// Routes For Message Operations
router.post('/message/add-message', ensureAuthenticated.validateToken, Fileupload.upload('attachment'), eventValidation.thanksMessageDetail, EventController.thanksMessageDetail);
router.get('/messagelist/:id', EventController.thanksMessageList);
router.get('/event/afterEventMessage/:id', ensureAuthenticated.validateToken, EventController.getAfterEventMessage)

// Routes For Adminside Functions
router.get('/event/event-detail/:id', EventController.eventDetailWithActivity);


// Routes For Event Collection API
router.get('/event-collection', EventController.activityWiseCollection);
router.get('/event-donation', EventController.eventDonationDetail);

// Routes For Guest List Detail API
router.get('/guest-list', EventController.eventGuestList);

// Routes For GuestList With Amount
router.get('/guest', EventController.eventGuestListWithAmount);

// Routes For Add Bank Account With Event
router.put('/bank-account', eventValidation.addBankAccountDetailToEvent, EventController.addBankAccountDetailToEvent);


router.put('/group-delete', EventController.deleteGroupFromActivity);
router.put('/group/delete-item', EventController.deleteItemFromGroup);
router.delete('/event-delete/:id', ensureAuthenticated.validateToken, EventController.deleteEvent);
router.get('/mycollection', ensureAuthenticated.validateToken, EventController.MyEventListTotalTransaction);
router.get('/event-transaction', EventController.eventWithTransactionAndUserDetail);


// Routes For generate pdf of guest list

router.post('/generatePdf' , ensureAuthenticated.validateToken , EventController.generatePdf)

module.exports = router;
