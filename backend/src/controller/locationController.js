import axios from "axios";

export const getProvinces = async (req, res) => {
  try {
    const { data } = await axios.get("https://provinces.open-api.vn/api/p/");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tỉnh", error });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { code } = req.params;
    const { data } = await axios.get(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`
    );
    res.json(data.districts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách quận/huyện", error });
  }
};

export const getWards = async (req, res) => {
  try {
    const { code } = req.params;
    const { data } = await axios.get(
      `https://provinces.open-api.vn/api/d/${code}?depth=2`
    );
    res.json(data.wards);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách xã/phường", error });
  }
};
