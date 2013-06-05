// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var AdsController = function(controller, player) {
  this.controller = controller;
  this.player = player;
  this.adContainer =  this.player.adContainer
  this.adDisplayContainer =
      new google.ima.AdDisplayContainer(this.adContainer);
  this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
  this.adsManager = null;
  this.adContainer.style.width = this.player.width+"px";
  this.adContainer.style.height = this.player.height+"px";

  this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded,
      false,
      this);
  this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError,
      false,
      this);
};

// On iOS and Android devices, video playback must begin in a user action.
// AdDisplayContainer provides a initialize() API to be called at appropriate
// time.
// This should be called when the user clicks or taps.
AdsController.prototype.initialUserAction = function() {
  this.adDisplayContainer.initialize();
};

AdsController.prototype.requestAds = function(adTagUrl) {
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = adTagUrl;
  adsRequest.linearAdSlotWidth = this.player.width;
  adsRequest.linearAdSlotHeight = this.player.height;
  adsRequest.nonLinearAdSlotWidth = this.player.width;
  adsRequest.nonLinearAdSlotHeight = this.player.height;
  this.adsLoader.requestAds(adsRequest);
};

AdsController.prototype.onAdsManagerLoaded = function(adsManagerLoadedEvent) {
  this.controller.log('Ads loaded.');
  this.adsManager = adsManagerLoadedEvent.getAdsManager(
      this.player.contentPlayer);
  this.processAdsManager(this.adsManager);
};

AdsController.prototype.processAdsManager = function(adsManager) {
  // Attach the pause/resume events.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      this.onContentPauseRequested,
      false,
      this);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      this.onContentResumeRequested,
      false,
      this);
  // Handle errors.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError,
      false,
      this);
  var events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                google.ima.AdEvent.Type.CLICK,
                google.ima.AdEvent.Type.COMPLETE,
                google.ima.AdEvent.Type.FIRST_QUARTILE,
                google.ima.AdEvent.Type.LOADED,
                google.ima.AdEvent.Type.MIDPOINT,
                google.ima.AdEvent.Type.PAUSED,
                google.ima.AdEvent.Type.STARTED,
                google.ima.AdEvent.Type.THIRD_QUARTILE];
  for (var index in events) {
    adsManager.addEventListener(
        events[index],
        this.onAdEvent,
        false,
        this);
  }

  adsManager.init(
      this.player.width,
      this.player.height,
      google.ima.ViewMode.NORMAL);
  adsManager.start();
};

AdsController.prototype.pause = function() {
  if (this.adsManager) {
    this.adsManager.pause();
  }
};

AdsController.prototype.resume = function() {
  if (this.adsManager) {
    this.adsManager.resume();
  }
};

AdsController.prototype.onContentPauseRequested = function(adErrorEvent) {
  this.controller.pauseForAd();
};

AdsController.prototype.onContentResumeRequested = function(adErrorEvent) {
  this.controller.resumeAfterAd();
};

AdsController.prototype.onAdEvent = function(adEvent) {
  this.controller.log('Ad event: ' + adEvent.type);

  if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
    this.controller.adClicked();
  }
};


AdsController.prototype.onAdError = function(adErrorEvent) {
  this.controller.log('Ad error: ' + adErrorEvent.getError().toString());
  if (this.adsManager) {
    this.adsManager.destroy();
  }
  this.controller.resumeAfterAd();
};
