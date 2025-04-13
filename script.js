// ⚽️ VIỆT VỊ 
/* ---------------------------------------------------------------------------------------------
                                          LƯU Ý !!!       
- Đây Chỉ Là Ví Dụ CHo Tính Năng Việt Vị
- Để Sử Dụng Trơn Tru Bạn Cần Hiểu Nó Và Đồng Bộ Với Script
  Của Bạn Để Hoạt Động Tốt

*Nguyên lý hoạt động:
Khi cầu thủ A chuyền bóng, hệ thống kiểm tra xem đồng đội có đứng vượt hậu vệ cuối cùng không.
Nếu có, người đó bị đánh dấu việt vị tạm thời.
Nếu cầu thủ đó chạm bóng, cảnh báo việt vị được kích hoạt, bóng bị reset lại giữa sân.

#idea: Wendal @ The Van Hoi
#Remake: Bav

@Discord: bap_trdai

 ----------------------------------------------------------------------------------------------- */

// === CẤU HÌNH ===
var toggle_offside = true; // Bật/Tắt hệ thống việt vị
var lastPasser = null; // Người chuyền bóng gần nhất
var lastPassTime = 0;
var offsidePlayers = {}; // Danh sách cầu thủ việt vị tiềm năng

// === GHI NHẬN NGƯỜI CHUYỀN BÓNG ===
room.onPlayerBallKick = function(player) {
	if (!toggle_offside || player.team == 0) return;

	// Nếu cầu thủ đang bị việt vị chạm bóng
	if (offsidePlayers[player.id]) {
		room.sendAnnouncement("⚠️ VIỆT VỊ! " + player.name, null, 0xFF0000, "bold", 2);
		room.setDiscProperties(0, {x: 0, y: 0, xspeed: 0, yspeed: 0}); // Reset bóng giữa sân
		offsidePlayers = {}; // Xoá trạng thái việt vị
		return;
	}

	// Là người chuyền mới
	lastPasser = player;
	lastPassTime = Date.now();
	offsidePlayers = {}; // Xoá danh sách cũ
	checkPotentialOffside(player);
};

// === HÀM KIỂM TRA VIỆT VỊ ===
function checkPotentialOffside(passer) {
	let team = passer.team;
	let opponents = room.getPlayerList().filter(p => p.team != team && p.team != 0);
	let teammates = room.getPlayerList().filter(p => p.team == team && p.id != passer.id);
	let ballPos = room.getBallPosition();

	// Sắp xếp đối thủ theo khoảng cách tới khung thành
	let sortedOpponents = [...opponents].sort((a, b) => {
		return team == 1 ? a.position.x - b.position.x : b.position.x - a.position.x;
	});

	let lastDefenderX = sortedOpponents[1]?.position?.x; // Hậu vệ thứ 2 cuối cùng
	if (lastDefenderX === undefined) return;

	for (let mate of teammates) {
		if (!mate.position) continue;

		let isOffside = false;
		if (team == 1) {
			if (mate.position.x > lastDefenderX && mate.position.x > passer.position.x && mate.position.x > ballPos.x) {
				isOffside = true;
			}
		} else {
			if (mate.position.x < lastDefenderX && mate.position.x < passer.position.x && mate.position.x < ballPos.x) {
				isOffside = true;
			}
		}

		if (isOffside) {
			offsidePlayers[mate.id] = true;
		}
	}
}

// === RESET TRẠNG THÁI KHI BÀN HOẶC RA BIÊN ===
room.onTeamGoal = function(team) {
	offsidePlayers = {};
};

room.onPositionsReset = function() {
	offsidePlayers = {};
};
