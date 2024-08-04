let LANG = {
  Add: "新增",
  Edit: "修改",
  AlarmRule: "警報規則",
  Notification: "通知方式",
  NAT: "NAT 通道",
  Server: "伺服器",
  Monitor: "監視",
  Cron: "工作排程"
};

function updateLang(newLang) {
  if (newLang) {
    LANG = newLang;
  }
}

function readableBytes(bytes) {
  if (!bytes) {
    return '0 B';
  }
  var i = Math.floor(Math.log(bytes) / Math.log(1024)), sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

const confirmBtn = $(".mini.confirm.modal .main-primary-btn.button");

function showConfirm(title, content, callFn, extData) {
  const modal = $(".mini.confirm.modal");
  modal.children(".header").text(title);
  modal.children(".content").text(content);
  if (confirmBtn.hasClass("loading")) {
    return false;
  }
  modal.modal({
    closable: true,
    onApprove: function () {
      confirmBtn.toggleClass("loading");
      callFn(extData);
      return false;
    }
  }).modal("show");
}

function postJson(url, data) {
  return $.ajax({
    url: url,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  }).done((resp) => {
    if (resp.code === 200) {
      if (resp.message) {
        alert(resp.message);
      } else {
        alert("刪除成功");
      }
      window.location.reload();
    } else {
      alert("刪除失敗 " + resp.code + " : " + resp.message);
      confirmBtn.toggleClass("loading");
    }
  }).fail((err) => {
    alert("網路錯誤 : " + err.responseText);
  });
}

function showFormModal(modelSelector, formID, URL, getData) {
  $(modelSelector).modal({
    closable: true,
    onApprove: function () {
      let success = false;
      const btn = $(modelSelector + " .main-primary-btn.button");
      const form = $(modelSelector + " form");
      if (btn.hasClass("loading")) {
        return success;
      }
      form.children(".message").remove();
      btn.toggleClass("loading");
      const data = getData ? getData() : $(formID).serializeArray().reduce(function (obj, item) {
        // ID 類的資料
        if (
          item.name.endsWith("_id") ||
          item.name === "id" ||
          item.name === "ID" ||
          item.name === "ServerID" ||
          item.name === "RequestType" ||
          item.name === "RequestMethod" ||
          item.name === "TriggerMode" ||
          item.name === "TaskType" ||
          item.name === "DisplayIndex" ||
          item.name === "Type" ||
          item.name === "Cover" ||
          item.name === "Duration"
        ) {
          obj[item.name] = parseInt(item.value);
        } else if (item.name.endsWith("Latency")) {
          obj[item.name] = parseFloat(item.value);
        } else {
          obj[item.name] = item.value;
        }

        if (item.name.endsWith("ServersRaw")) {
          if (item.value.length > 2) {
            obj[item.name] = JSON.stringify([...item.value.matchAll(/\d+/gm)].map((k) => parseInt(k[0])));
          }
        }

        if (item.name.endsWith("TasksRaw")) {
          if (item.value.length > 2) {
            obj[item.name] = JSON.stringify([...item.value.matchAll(/\d+/gm)].map((k) => parseInt(k[0])));
          }
        }
        return obj;
      }, {
      });
      $.post(URL, JSON.stringify(data)).done(function (resp) {
        if (resp.code === 200) {
          window.location.reload();
        } else {
          form.append(`<div class="ui negative message"><div class="header">作業失敗</div><p>` +
            resp.message.replaceAll("请求错误：", "請求錯誤 : ") +
            `</p></div>`
          );
        }
      }).fail(function (err) {
        form.append(`<div class="ui negative message"><div class="header">網路錯誤</div><p>` +
          err.responseText +
          `</p></div>`
        );
      }).always(function () {
        btn.toggleClass("loading");
      });
      return success;
    }
  }).modal("show");
}

function addOrEditAlertRule(rule) {
  const modal = $(".rule.modal");
  modal.children(".header").text((rule ? LANG.Edit : LANG.Add) + LANG.AlarmRule);
  modal.find(".main-primary-btn.button").html(rule ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=ID]").val(rule ? rule.ID : null);
  modal.find("input[name=Name]").val(rule ? rule.Name : null);
  modal.find("textarea[name=RulesRaw]").val(rule ? rule.RulesRaw : null);
  modal.find("select[name=TriggerMode]").val(rule ? rule.TriggerMode : 0);
  modal.find("input[name=NotificationTag]").val(rule ? rule.NotificationTag : null);
  if (rule && rule.Enable) {
    modal.find(".ui.rule-enable.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.rule-enable.checkbox").checkbox("set unchecked");
  }
  modal.find("a.ui.label.visible").each((i, el) => {
    el.remove();
  });
  var failTriggerTasks;
  var recoverTriggerTasks;
  if (rule) {
    failTriggerTasks = rule.FailTriggerTasksRaw;
    recoverTriggerTasks = rule.RecoverTriggerTasksRaw;
    const failTriggerTasksList = JSON.parse(failTriggerTasks || "[]");
    const recoverTriggerTasksList = JSON.parse(recoverTriggerTasks || "[]");
    const node1 = modal.find("i.dropdown.icon.1");
    const node2 = modal.find("i.dropdown.icon.2");
    for (let i = 0; i < failTriggerTasksList.length; ++i) {
      node1.after('<a class="ui label transition visible" data-value="' +
        failTriggerTasksList[i] +
        '" style="display: inline-block !important;">ID : ' +
        failTriggerTasksList[i] +
        '<i class="delete icon"></i></a>'
      );
    }
    for (let i = 0; i < recoverTriggerTasksList.length; ++i) {
      node2.after('<a class="ui label transition visible" data-value="' +
        recoverTriggerTasksList[i] +
        '" style="display: inline-block !important;">ID : ' +
        recoverTriggerTasksList[i] +
        '<i class="delete icon"></i></a>'
      );
    }
  }
  modal.find("input[name=FailTriggerTasksRaw]").val(rule ? "[]," + failTriggerTasks.substr(1, failTriggerTasks.length - 2) : "[]");
  modal.find("input[name=RecoverTriggerTasksRaw]").val(rule ? "[]," + recoverTriggerTasks.substr(1, recoverTriggerTasks.length - 2) : "[]");
  showFormModal(".rule.modal", "#ruleForm", "/api/alert-rule");
}

function addOrEditNotification(notification) {
  const modal = $(".notification.modal");
  modal.children(".header").text((notification ? LANG.Edit : LANG.Add) + LANG.Notification);
  modal.find(".main-primary-btn.button").html(notification ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=ID]").val(notification ? notification.ID : null);
  modal.find("input[name=Name]").val(notification ? notification.Name : null);
  modal.find("input[name=Tag]").val(notification ? notification.Tag : null);
  modal.find("input[name=URL]").val(notification ? notification.URL : null);
  modal.find("textarea[name=RequestHeader]").val(notification ? notification.RequestHeader : null);
  modal.find("textarea[name=RequestBody]").val(notification ? notification.RequestBody : null);
  modal.find("select[name=RequestMethod]").val(notification ? notification.RequestMethod : 1);
  modal.find("select[name=RequestType]").val(notification ? notification.RequestType : 1);
  if (notification && notification.VerifySSL) {
    modal.find(".ui.nf-ssl.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.nf-ssl.checkbox").checkbox("set unchecked");
  }
  modal.find(".ui.nf-skip-check.checkbox").checkbox("set unchecked");
  showFormModal(
    ".notification.modal",
    "#notificationForm",
    "/api/notification"
  );
}

function addOrEditNAT(nat) {
  const modal = $(".nat.modal");
  modal.children(".header").text((nat ? LANG.Edit : LANG.Add) + LANG.NAT);
  modal.find(".main-primary-btn.button").html(nat ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=ID]").val(nat ? nat.ID : null);
  modal.find("input[name=ServerID]").val(nat ? nat.ServerID : null);
  modal.find("input[name=Name]").val(nat ? nat.Name : null);
  modal.find("input[name=Host]").val(nat ? nat.Host : null);
  modal.find("input[name=Domain]").val(nat ? nat.Domain : null);
  showFormModal(
    ".nat.modal",
    "#natForm",
    "/api/nat"
  );
}

function connectToServer(id) {
  post('/terminal', {
    Host: window.location.host,
    Protocol: window.location.protocol,
    ID: id
  });
}

function post(path, params, method = 'post') {
  const form = document.createElement('form');
  form.method = method;
  form.action = path;
  form.target = "_blank";

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function issueNewApiToken(apiToken) {
  const modal = $(".api.modal");
  modal.children(".header").text((apiToken ? LANG.Edit : LANG.Add) + " API Token");
  modal.find(".main-primary-btn.button").html(apiToken ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("textarea[name=Note]").val(apiToken ? apiToken.Note : null);
  showFormModal(".api.modal", "#apiForm", "/api/token");
}

function addOrEditServer(server, conf) {
  const modal = $(".server.modal");
  modal.children(".header").text((server ? LANG.Edit : LANG.Add) + LANG.Server);
  modal.find(".main-primary-btn.button").html(server ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=id]").val(server ? server.ID : null);
  modal.find("input[name=name]").val(server ? server.Name : null);
  modal.find("input[name=Tag]").val(server ? server.Tag : null);
  modal.find("input[name=DDNSDomain]").val(server ? server.DDNSDomain : null);
  modal.find("input[name=DDNSProfile]").val(server ? server.DDNSProfile : null);
  modal.find("input[name=DisplayIndex]").val(server ? server.DisplayIndex : null);
  modal.find("textarea[name=Note]").val(server ? server.Note : null);
  if (server) {
    modal.find(".secret.field").attr("style", "");
    modal.find(".command.field").attr("style", "");
    modal.find(".command.hostSecret").text(server.Secret);
    modal.find("input[name=secret]").val(server.Secret);
  } else {
    modal.find(".secret.field").attr("style", "display: none");
    modal.find(".command.field").attr("style", "display: none");
    modal.find("input[name=secret]").val("");
  }
  if (server && server.HideForGuest) {
    modal.find(".ui.hideforguest.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.hideforguest.checkbox").checkbox("set unchecked");
  }
  if (server && server.EnableDDNS) {
    modal.find(".ui.enableddns.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.enableddns.checkbox").checkbox("set unchecked");
  }
  if (server && server.EnableIPv4) {
    modal.find(".ui.enableipv4.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.enableipv4.checkbox").checkbox("set unchecked");
  }
  if (server && server.EnableIpv6) {
    modal.find(".ui.enableipv6.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.enableipv6.checkbox").checkbox("set unchecked");
  }
  showFormModal(".server.modal", "#serverForm", "/api/server");
}

function addOrEditMonitor(monitor) {
  const modal = $(".monitor.modal");
  modal.children(".header").text((monitor ? LANG.Edit : LANG.Add) + LANG.Monitor);
  modal.find(".main-primary-btn.button").html(monitor ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=ID]").val(monitor ? monitor.ID : null);
  modal.find("input[name=Name]").val(monitor ? monitor.Name : null);
  modal.find("input[name=Target]").val(monitor ? monitor.Target : null);
  modal.find("input[name=Duration]").val(monitor && monitor.Duration ? monitor.Duration : 30);
  modal.find("select[name=Type]").val(monitor ? monitor.Type : 1);
  modal.find("select[name=Cover]").val(monitor ? monitor.Cover : 0);
  modal.find("input[name=NotificationTag]").val(monitor ? monitor.NotificationTag : null);
  if (monitor && monitor.EnableShowInService) {
    modal.find(".ui.nb-show-in-service.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.nb-show-in-service.checkbox").checkbox("set unchecked");
  }
  if (monitor && monitor.Notify) {
    modal.find(".ui.nb-notify.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.nb-notify.checkbox").checkbox("set unchecked");
  }
  modal.find("input[name=MaxLatency]").val(monitor ? monitor.MaxLatency : null);
  modal.find("input[name=MinLatency]").val(monitor ? monitor.MinLatency : null);
  if (monitor && monitor.LatencyNotify) {
    modal.find(".ui.nb-lt-notify.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.nb-lt-notify.checkbox").checkbox("set unchecked");
  }
  modal.find("a.ui.label.visible").each((i, el) => {
    el.remove();
  });
  if (monitor && monitor.EnableTriggerTask) {
    modal.find(".ui.nb-EnableTriggerTask.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.nb-EnableTriggerTask.checkbox").checkbox("set unchecked");
  }
  var servers;
  var failTriggerTasks;
  var recoverTriggerTasks;
  if (monitor) {
    servers = monitor.SkipServersRaw;
    const serverList = JSON.parse(servers || "[]");
    const node = modal.find("i.dropdown.icon.specificServer");
    for (let i = 0; i < serverList.length; ++i) {
      node.after('<a class="ui label transition visible" data-value="' +
        serverList[i] +
        '" style="display: inline-block !important;">ID : ' +
        serverList[i] +
        '<i class="delete icon"></i></a>'
      );
    }

    failTriggerTasks = monitor.FailTriggerTasksRaw;
    recoverTriggerTasks = monitor.RecoverTriggerTasksRaw;
    const failTriggerTasksList = JSON.parse(failTriggerTasks || "[]");
    const recoverTriggerTasksList = JSON.parse(recoverTriggerTasks || "[]");
    const node1 = modal.find("i.dropdown.icon.failTask");
    const node2 = modal.find("i.dropdown.icon.recoverTask");
    for (let i = 0; i < failTriggerTasksList.length; ++i) {
      node1.after('<a class="ui label transition visible" data-value="' +
        failTriggerTasksList[i] +
        '" style="display: inline-block !important;">ID : ' +
        failTriggerTasksList[i] +
        '<i class="delete icon"></i></a>'
      );
    }
    for (let i = 0; i < recoverTriggerTasksList.length; ++i) {
      node2.after('<a class="ui label transition visible" data-value="' +
        recoverTriggerTasksList[i] +
        '" style="display: inline-block !important;">ID : ' +
        recoverTriggerTasksList[i] +
        '<i class="delete icon"></i></a>'
      );
    }
  }
  modal.find("input[name=FailTriggerTasksRaw]").val(monitor ? "[]," + failTriggerTasks.substr(1, failTriggerTasks.length - 2) : "[]");
  modal.find("input[name=RecoverTriggerTasksRaw]").val(monitor ? "[]," + recoverTriggerTasks.substr(1, recoverTriggerTasks.length - 2) : "[]");
  modal.find("input[name=SkipServersRaw]").val(monitor ? "[]," + servers.substr(1, servers.length - 2) : "[]");
  showFormModal(".monitor.modal", "#monitorForm", "/api/monitor");
}

function addOrEditCron(cron) {
  const modal = $(".cron.modal");
  modal.children(".header").text((cron ? LANG.Edit : LANG.Add) + LANG.Cron);
  modal.find(".main-primary-btn.button").html(cron ? LANG.Edit + ' <i class="edit icon"></i>' : LANG.Add + ' <i class="add icon"></i>');
  modal.find("input[name=ID]").val(cron ? cron.ID : null);
  modal.find("input[name=Name]").val(cron ? cron.Name : null);
  modal.find("select[name=TaskType]").val(cron ? cron.TaskType : 0);
  modal.find("select[name=Cover]").val(cron ? cron.Cover : 0);
  modal.find("input[name=NotificationTag]").val(cron ? cron.NotificationTag : null);
  modal.find("input[name=Scheduler]").val(cron ? cron.Scheduler : null);
  modal.find("a.ui.label.visible").each((i, el) => {
    el.remove();
  });
  var servers;
  if (cron) {
    servers = cron.ServersRaw;
    const serverList = JSON.parse(servers || "[]");
    const node = modal.find("i.dropdown.icon");
    for (let i = 0; i < serverList.length; ++i) {
      node.after('<a class="ui label transition visible" data-value="' +
        serverList[i] +
        '" style="display: inline-block !important;">ID : ' +
        serverList[i] +
        '<i class="delete icon"></i></a>'
      );
    }
  }
  modal.find("input[name=ServersRaw]").val(cron ? "[]," + servers.substr(1, servers.length - 2) : "[]");
  modal.find("textarea[name=Command]").val(cron ? cron.Command : null);
  if (cron && cron.PushSuccessful) {
    modal.find(".ui.push-successful.checkbox").checkbox("set checked");
  } else {
    modal.find(".ui.push-successful.checkbox").checkbox("set unchecked");
  }
  showFormModal(".cron.modal", "#cronForm", "/api/cron");
}

function deleteRequest(api) {
  $.ajax({
    url: api,
    type: "DELETE"
  }).done((resp) => {
    if (resp.code === 200) {
      if (resp.message) {
        alert(resp.message);
      } else {
        alert("刪除成功");
      }
      window.location.reload();
    } else {
      alert("刪除失敗 " + resp.code + " : " + resp.message);
      confirmBtn.toggleClass("loading");
    }
  }).fail((err) => {
    alert("網路錯誤 : " + err.responseText);
  });
}

function manualTrigger(btn, cronId) {
  $(btn).toggleClass("loading");
  $.ajax({
    url: "/api/cron/" + cronId + "/manual",
    type: "GET"
  }).done((resp) => {
    $(btn).toggleClass("loading");
    if (resp.code === 200) {
      $.suiAlert({
        title: "觸發成功，等待執行結果",
        type: "success",
        description: resp.message,
        time: "3",
        position: "top-center"
      });
    } else {
      $.suiAlert({
        title: "觸發失敗",
        type: "error",
        description: resp.code + " : " + resp.message,
        time: "3",
        position: "top-center"
      });
    }
  }).fail((err) => {
    $(btn).toggleClass("loading");
    $.suiAlert({
      title: "觸發失敗",
      type: "error",
      description: "網路錯誤 : " + err.responseText,
      time: "3",
      position: "top-center"
    });
  });
}

function logout(id) {
  $.post("/api/logout", JSON.stringify({
    id: id
  })).done(function (resp) {
    if (resp.code === 200) {
      $.suiAlert({
        title: "登出成功",
        type: "success",
        description: "如需繼續存取請使用 GitHub 再次登入",
        time: "3",
        position: "top-center"
      });
      window.location.reload();
    } else {
      $.suiAlert({
        title: "登出失敗",
        description: resp.code + " : " + resp.message,
        type: "error",
        time: "3",
        position: "top-center"
      });
    }
  }).fail(function (err) {
    $.suiAlert({
      title: "網路錯誤",
      description: err.responseText,
      type: "error",
      time: "3",
      position: "top-center"
    });
  });
}

$(document).ready(() => {
  try {
    $(".ui.servers.search.dropdown").dropdown({
      clearable: true,
      apiSettings: {
        url: "/api/search-server?word={query}",
        cache: false
      }
    });
  } catch (error) {
  }
});

$(document).ready(() => {
  try {
    $(".ui.tasks.search.dropdown").dropdown({
      clearable: true,
      apiSettings: {
        url: "/api/search-tasks?word={query}",
        cache: false
      }
    });
  } catch (error) {
  }
});