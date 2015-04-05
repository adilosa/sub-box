var videos = [];

function handleAPILoaded() {
    requestUserSubscriptions();
}

function requestUserSubscriptions(pageToken) {
    var requestOptions = {
        mine: true,
        part: 'snippet',
        maxResults: 50
    }
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }
    var request = gapi.client.youtube.subscriptions.list(requestOptions);
    request.execute(function (response) {
        var subscriptions = response.result.items;
        if (subscriptions) {
            $.each(subscriptions, function(i, subscription) {
                requestChannelInfo(subscription.snippet.resourceId.channelId);
            });
        } else {
            $("#video-container").html('Sorry you have no subscriptions');
        }
        if (response.nextPageToken) {
            requestUserSubscriptions(response.nextPageToken);
        }
    });
}

function requestChannelInfo(channelId) {
    var request = gapi.client.youtube.channels.list({
        part: 'contentDetails',
        id: channelId
    });
    request.execute(function (response) {
        var channel = response.result.items;
        if (channel) {
            var uploadsId = channel[0].contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(uploadsId);
        } else {
            alert("No such channel " + channelId);
        }
    });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId) {
    var request = gapi.client.youtube.playlistItems.list({
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 5
    });
    request.execute(function (response) {
        var playlistItems = response.result.items;
        if (playlistItems) {
            $.each(playlistItems, function (index, item) {
                videos.push(item.snippet);
            });
        } else {
            $('#video-container').html('Sorry you have no uploaded videos');
        }
    });
}

function displayVideos() {
    console.log(videos.length);
    videos.sort(PlaylistItemComparator);
    var html = "";
    $.each(videos, function(i, video) {
        html += "<p>" + video.title + " - " + video.channelTitle + " - " + new Date(video.publishedAt).toLocaleString() + "</p>";
    });
    $("#video-container").html(html);
}

function PlaylistItemComparator(a, b) {
    var aDate = new Date(a.publishedAt);
    var bDate = new Date(b.publishedAt);
    return aDate > bDate ? -1 : (aDate < bDate ? 1 : 0);
}

function displayResult(videoSnippet) {
    var title = videoSnippet.title;
    var videoId = videoSnippet.resourceId.videoId;
    $('#video-container').append('<p>' + title + ' - ' + videoSnippet.channelTitle + '</p>');
}
