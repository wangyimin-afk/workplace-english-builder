# 苹果配件识别/枚举工具

本工具是一个 macOS 本地 Web App，用于做苹果配件的一致性检查、协议级识别和风险提示。它不会输出“官方验真”“确认正品”“100% 原装”等结论。

## 文件结构

- `launch.command`：双击启动本地 App。
- `cable_checker_app.py`：后端采集、parser、评分逻辑和前端页面。
- `README.md`：使用说明。

## 运行命令

双击 `launch.command`，或在终端运行：

```bash
cd "/Users/apple/Desktop/未命名文件夹 2"
python3 cable_checker_app.py
```

## 采集来源

- `system_profiler SPUSBDataType -json`，为空时自动回退到 `SPUSBHostDataType -json`
- `system_profiler SPPowerDataType -json`
- `system_profiler SPThunderboltDataType -json`
- `ioreg -p IOUSB -l` 辅助摘要
- `ioreg -p IOUSBHost -l` 辅助摘要
- `ioreg -l` 关键词扫描，提取 Cable、E-Marker、Current、Power、USB4、Thunderbolt、PD、Vendor、Product、Serial、EPR 等相关行

## 关键解析逻辑

parser 会递归展开 `system_profiler` 嵌套 JSON，提取并归一化这些字段：名称、厂商、Vendor ID、Product ID、Serial Number、Firmware Version、Hardware Version、Power/Wattage、Current、Voltage、USB Speed、Location ID、Receptacle Status。

归类结果包括：

- `apple_device`
- `apple_charger`
- `usb_port`
- `thunderbolt_port`
- `cable_or_unknown`
- `unknown`

`receptacle_no_devices_connected` 会被识别为端口未连接，不会当成外接设备。`sppower_ac_charger_information` 会被识别为当前 Mac 电源适配器/充电器状态；如果 `sppower_battery_charger_connected = FALSE`，界面会显示未检测到外接充电器。

## 输出界面

- 总览卡片：检测时间、Apple 相关设备数量、充电器数量、可疑/信息不足数量、综合结论、评分。
- 端口拓扑视图：每个端口或连接链路一张卡片。
- 设备详情卡片：每个识别项目一张卡片，只显示整理后的关键字段。
- 判断解释：说明正向信号、限制和建议。
- 原始数据折叠区：保留原始 JSON，但默认折叠。

支持刷新检测、复制报告、导出 JSON、导出 Markdown。

## USB-C 线材 / E-marker 检测

界面顶部可以输入外壳刻字，例如 `Apple A2795 China` 或 `Apple A2795 Vietnam`。这只会被记录为“外观文字声称”，不会直接作为真伪依据。

线材检测会尽量读取：

- 是否检测到 E-marker
- 最大电流：3A / 5A
- 最大功率：60W / 100W / 240W
- 数据能力：USB2.0 / USB3 / USB4 / Thunderbolt
- 是否支持 USB4 / 40Gbps
- 是否支持 EPR / 240W
- Vendor / Manufacturer、Product ID、Serial Number

如果只插一根空 USB-C 线，macOS 很可能无法读取线材身份。此时工具会显示信息不足，不会直接判假。要测高功率线，建议使用 `MacBook + 线 + 高功率 PD 充电器`；要测数据能力，建议使用 `MacBook + 线 + 支持高速的 USB-C 设备`。
