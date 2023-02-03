/* Load builds from amazon */
function keys(obj)
{
		var keys = [];
		for(var key in obj)
		{
				if(obj.hasOwnProperty(key))
				{
						keys.push(key);
				}
		}
		return keys;
}

function format_size(bytes) {
	var i = 0;
	var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	while(bytes > 1024 && i < 8)
	{
			bytes = bytes/1024;
			i++;
	} 
	return Math.max(bytes, 0.1).toFixed(1) + ' ' + units[i];
};

function urlExists(url, callback){
  $.ajax({
    type: 'HEAD',
    url: url,
    success: function(){
      callback(true);
    },
    error: function() {
      callback(false);
    }
  });
}

$(document).ready(function() {
	$('#builds').removeClass("hide-element");

	var unknown_branch = "[others]"
	var master_branch = "master"
	var builds = new Array();
	var branches = [];

	function add_build(branch, commit, platform, last_modified, build)
	{
		if(!builds.hasOwnProperty(branch))
		{
			builds[branch] = new Array();
			branches.push(branch);
		}
		if(!builds[branch].hasOwnProperty(commit))
		{
			builds[branch][commit] = {
				last_modified: last_modified,
				platforms: {
					android: null,
					win: null,
					osx: null,
					ios: null,
					switch: null,
					xbox: null,
					linux: null
				},
			}
		}
		builds[branch][commit].platforms[platform] = build;
		if(builds[branch][commit].last_modified > last_modified)
		{
			builds[branch][commit].last_modified = last_modified;
		}
	}

	function print_builds(element)
	{
		// Create a sorted list of branches
		branches.sort();
		var pos = branches.indexOf(master_branch)
		if (pos > 0)
		{
			branches.splice(pos, 1);
			branches.unshift(master_branch);
		}
		pos = branches.indexOf(unknown_branch)
		if (pos >= 0)
		{
			branches.splice(pos, 1);
			branches.push(unknown_branch);
		}

		var el_table = $('<table></table>');

		// Loop over branches
		for(i = 0; i < branches.length; i++)
		{
			var branch_name = branches[i];
			var branch = builds[branch_name];
			el_table.append('<tr><th colspan="3" class="branch" id="' + branch_name +  '">' + branch_name + '</th></tr>');
			el_table.append('<tr><th>Commit</th><th>Date</th>'
				+ '<th><img src="android.jpg" /> Android</th>'
				+ '<th><img src="windows.png" /> Windows x64</th>'
				+ '<th><img src="ubuntu.png" /> Linux AppImage</th>'
				+ '<th><img src="apple.png" /> macOS</th>'
				+ '<th><img src="apple.png" /> iOS</th>'
				+ '<th><img src="switch.png" /> Switch</th>'
				+ '<th><img src="xbox.png" /> Xbox One</th>'
				+ '<th>Test Results</th></tr>');

			// Create a sorted list of commit ids
			var commit_ids = keys(branch).sort(function(a, b)
			{
				var date_a = branch[a].last_modified;
				var date_b = branch[b].last_modified
				return ((date_a > date_b) ? -1 : ((date_a < date_b) ? 1 : 0));
			});

			for(var j = 0; j < commit_ids.length; j++)
			{
				var s_trclass = ((j % 2) == 0) ? ' class="even"' : '';
				let commit_id = commit_ids[j];
				var commit = branch[commit_id];
				var s_date = commit.last_modified.toISOString();
				var s_commit = '<a href="https://github.com/flyinghead/flycast/commit/' + commit_id + '" data-action="info" data-build="' + commit_id + '">'+ commit_id +'</a>';
				s_android = (commit.platforms.android == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.android.path 
					+ '">Download</a> (' + format_size(commit.platforms.android.filesize) + ')';
				s_win64 = (commit.platforms.win == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.win.path 
					+ '">Download</a> (' + format_size(commit.platforms.win.filesize) + ')';
				s_linux = (commit.platforms.linux == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.linux.path 
					+ '">Download</a> (' + format_size(commit.platforms.linux.filesize) + ')';
				s_osx = (commit.platforms.osx == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.osx.path 
					+ '">Download</a> (' + format_size(commit.platforms.osx.filesize) + ')';
				s_ios = (commit.platforms.ios == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.ios.path 
					+ '">Download</a> (' + format_size(commit.platforms.ios.filesize) + ')';
				s_switch = (commit.platforms.switch == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.switch.path 
					+ '">Download</a> (' + format_size(commit.platforms.switch.filesize) + ')';
				s_xbox = (commit.platforms.xbox == null) ? '' : '<a data-action="download" data-build="' 
					+ commit_id + '" href="https://flycast-builds.s3.amazonaws.com/' + commit.platforms.xbox.path 
					+ '">Download</a> (' + format_size(commit.platforms.xbox.filesize) + ')';
				var test_column;
				test_column = '<td><a style="display:none" id="test' + commit_id 
					+ '" href="test-results.html?hash=' + commit_id + '">Tests</a></td>';
				el_table.append('<tr'+s_trclass+'><td class="commit">' + s_commit  + '</td><td class="date">' 
					+ commit.last_modified.toISOString() + '</td><td>' + s_android 
					+ '</td><td>' + s_win64 + '</td><td>' 
					+ s_linux + '</td><td>'
					+ s_osx + '</td><td>'
					+ s_ios + '</td><td>'
					+ s_switch + '</td><td>'
					+ s_xbox + '</td>'
					+ test_column + '</tr>');
				urlExists("https://flycast-tests.s3.us-east-2.amazonaws.com/" + commit_id + "/result-us.json", function(exists) {
					if (exists)
						$("#test" + commit_id).show();
				});
			}
		}

		$(element).empty();
		$(element).append(el_table);
	}

	$.when(
		// Get the builds
		$.get("https://flycast-builds.s3.amazonaws.com/")
	).then(function(xml_builds)
	{
		// Parse the builds
		contents = xml_builds.documentElement.getElementsByTagName('Contents');
		for(i = 0; i < contents.length; i++)
		{
			var path = contents[i].getElementsByTagName('Key')[0].firstChild.data;
			var first_slash = path.indexOf("/");
			var system = path.substring(0, first_slash);
			var regexp = new RegExp("^" + system + "\/heads\/", "g");
			var branch = path.indexOf(system + "/heads") == 0 && path.replace(regexp,"").replace(/\/[^\/]*$/,"").replace(/\-[^\-]*$/,"") || unknown_branch;
			var name = path.substring(path.lastIndexOf("/") + 1);
			var dirname = path.substring(0, path.lastIndexOf("/"));
			var commit = dirname.substring(dirname.lastIndexOf("-") + 1).substring(0, 7);
			var filesize = contents[i].getElementsByTagName('Size')[0].firstChild.data;
			var last_modified = new Date(contents[i].getElementsByTagName('LastModified')[0].firstChild.data);
			add_build(branch, commit, system, last_modified, {
				name: name,
				path: path,
				filesize: filesize,
				last_modified: last_modified
			});
		}

		print_builds("#builds");
	});
});

