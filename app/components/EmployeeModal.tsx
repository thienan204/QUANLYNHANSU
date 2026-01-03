"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, Row, Col, message, Select, Switch } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { FORM_ITEM_STYLE, ROW_GUTTER } from "@/lib/form-config";
import { useSession } from "next-auth/react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MinusCircleOutlined, PlusOutlined, SettingOutlined, SaveOutlined } from "@ant-design/icons";
import { Checkbox } from "antd";

// --- Types ---
interface Employee {
    id?: number;
    maNv: string;
    hoTen: string;
    ngaySinh?: string;
    gioiTinhId?: number;
    chucVuId?: number;
    danTocId?: number;
    hopDongId?: number;
    chungChiHanhNgheId?: number;
    trinhDoId?: number;
    khoaPhongId?: number;
    chucDanhId?: number;
    ngayBoNhiem?: string;
    ngayBoNhiemLai?: string;
    ngayBnl?: string;
    lyLuanChinhTri?: string;
    qlNhaNuoc?: string;
    qlBenhVien?: string;
    ngoaiNgu?: string;
    tinHoc?: string;
    qpAnNinh?: string;
    ghiChu?: string;
    kiemNhiem?: { khoaPhongId: number; chucVuId: number }[];
}

interface OptionType { id: number; name: string }

// --- Sortable Item Component ---
function SortableItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id, disabled: !props.enabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: props.enabled ? 'move' : 'default',
        border: props.enabled ? '1px dashed #ccc' : 'none',
        borderRadius: '4px',
        padding: props.enabled ? '4px' : '0',
    };

    return (
        <Col span={props.span} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </Col>
    );
}

// --- Main Modal Component ---
export default function EmployeeModal({ isOpen, onClose, onSave, employee, isViewMode = false }: any) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditLayout, setIsEditLayout] = useState(false);
    const [hasKiemNhiem, setHasKiemNhiem] = useState(false);

    // Lists for Selects
    const [categories, setCategories] = useState<any>({});

    // Field Config
    const DEFAULT_FIELDS = [
        "maNv", "hoTen", "ngaySinh", "gioiTinhId", "danTocId",
        "khoaPhongId", "chucDanhId", "chucVuId", "trinhDoId", "hopDongId", "chungChiHanhNgheId",
        "lyLuanChinhTri", "qlNhaNuoc", "qlBenhVien", "ngayBoNhiem", "ngayBoNhiemLai", "ngayBnl", "ngoaiNgu", "tinHoc",
        "ghiChu"
    ];
    const [fieldOrder, setFieldOrder] = useState<string[]>(DEFAULT_FIELDS);

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Fetch Categories
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const endpoints = [
                    { key: 'genders', url: '/api/gioi-tinh' },
                    { key: 'khoaPhongs', url: '/api/khoa-phong' },
                    { key: 'chucDanhs', url: '/api/chuc-danh' },
                    { key: 'trinhDos', url: '/api/trinh-do' },
                    { key: 'chucVus', url: '/api/chuc-vu' },
                    { key: 'danTocs', url: '/api/dan-toc' },
                    { key: 'hopDongs', url: '/api/hop-dong' },
                    { key: 'chungChis', url: '/api/chung-chi-hanh-nghe' },
                ];
                const results = await Promise.all(endpoints.map(e => fetch(e.url).then(r => r.ok ? r.json() : [])));
                const newCats: any = {};
                endpoints.forEach((e, i) => newCats[e.key] = results[i]);
                setCategories(newCats);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCats();
    }, []);

    // Fetch Layout
    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const res = await fetch("/api/form-config?key=employee_modal");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.layout && Array.isArray(data.layout)) {
                        // Merge with default to ensure no missing fields if new code added
                        const newLayout = [...data.layout];
                        DEFAULT_FIELDS.forEach(f => {
                            if (!newLayout.includes(f)) newLayout.push(f);
                        });
                        setFieldOrder(newLayout);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchLayout();
    }, []);

    // Set Form Data
    useEffect(() => {
        if (isOpen) {
            if (employee) {
                const formattedData = { ...employee };
                if (formattedData.ngaySinh) formattedData.ngaySinh = dayjs(formattedData.ngaySinh);
                else formattedData.ngaySinh = null;
                if (formattedData.ngayBoNhiem) formattedData.ngayBoNhiem = dayjs(formattedData.ngayBoNhiem);
                else formattedData.ngayBoNhiem = null;
                if (formattedData.ngayBoNhiemLai) formattedData.ngayBoNhiemLai = dayjs(formattedData.ngayBoNhiemLai);
                else formattedData.ngayBoNhiemLai = null;
                if (formattedData.ngayBnl) formattedData.ngayBnl = dayjs(formattedData.ngayBnl);
                else formattedData.ngayBnl = null;
                form.setFieldsValue(formattedData);
                setHasKiemNhiem(!!(employee.kiemNhiem && employee.kiemNhiem.length > 0));
            } else {
                form.resetFields();
                setHasKiemNhiem(false);
            }
        }
    }, [isOpen, employee, form]);

    const handleSaveLayout = async () => {
        try {
            await fetch("/api/form-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "employee_modal", layout: fieldOrder })
            });
            message.success("Layout saved!");
            setIsEditLayout(false);
        } catch (e) {
            message.error("Failed to save layout");
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFieldOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);
            const payload = { ...values };
            ['ngaySinh', 'ngayBoNhiem', 'ngayBoNhiemLai', 'ngayBnl'].forEach(f => {
                if (payload[f]) payload[f] = payload[f].toISOString();
            });

            const url = employee ? `/api/nhan-vien/${employee.id}` : "/api/nhan-vien";
            const method = employee ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            message.success("Success!");
            onSave();
            onClose();
        } catch (e: any) {
            message.error(e.message || "Error");
        } finally {
            setIsLoading(false);
        }
    };

    // Render Logic
    const renderField = (key: string) => {
        const commonProps = { style: FORM_ITEM_STYLE };

        // Define simple text fields
        const textFields: Record<string, string> = {
            maNv: "Mã NV", hoTen: "Họ và Tên", lyLuanChinhTri: "LL Chính trị",
            qlNhaNuoc: "QL Nhà nước", qlBenhVien: "QL Bệnh viện", ngoaiNgu: "Ngoại ngữ", tinHoc: "Tin học"
        };
        if (textFields[key]) {
            return (
                <Form.Item {...commonProps} name={key} label={textFields[key]} rules={[{ required: ['maNv', 'hoTen'].includes(key), message: 'Bắt buộc' }]}>
                    {isViewMode ? <span className="font-semibold">{employee?.[key as keyof Employee]}</span> : <Input disabled={key === 'maNv' && !!employee} />}
                </Form.Item>
            );
        }

        // Date fields
        const dateFields: Record<string, string> = {
            ngaySinh: "Ngày sinh", ngayBoNhiem: "Ngày Bổ nhiệm", ngayBoNhiemLai: "Ngày BN Lại", ngayBnl: "Ngày BN Lương"
        };
        if (dateFields[key]) {
            return (
                <Form.Item {...commonProps} name={key} label={dateFields[key]}>
                    {isViewMode ? <span>{employee?.[key as keyof Employee] ? dayjs(employee[key as keyof Employee] as string).format('DD/MM/YYYY') : ''}</span> :
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="dd/mm/yyyy" />}
                </Form.Item>
            );
        }

        // Select fields
        const selectMap: Record<string, { label: string, data: any[], labelKey: string }> = {
            gioiTinhId: { label: "Giới tính", data: categories.genders || [], labelKey: "tenGioiTinh" },
            danTocId: { label: "Dân Tộc", data: categories.danTocs || [], labelKey: "tenDanToc" },
            khoaPhongId: { label: "Khoa/Phòng", data: categories.khoaPhongs || [], labelKey: "tenKhoaPhong" },
            chucDanhId: { label: "Chức danh", data: categories.chucDanhs || [], labelKey: "tenChucDanh" },
            chucVuId: { label: "Chức vụ", data: categories.chucVus || [], labelKey: "tenChucVu" },
            trinhDoId: { label: "Trình độ", data: categories.trinhDos || [], labelKey: "tenTrinhDo" },
            hopDongId: { label: "Hợp đồng", data: categories.hopDongs || [], labelKey: "loaiHopDong" },
            chungChiHanhNgheId: { label: "Chứng chỉ", data: categories.chungChis || [], labelKey: "tenChungChi" },
        };

        if (selectMap[key]) {
            const conf = selectMap[key];
            // Helper to find name for view mode
            const viewVal = conf.data.find(d => d.id === employee?.[key as keyof Employee])?.[conf.labelKey];
            return (
                <Form.Item {...commonProps} name={key} label={conf.label}>
                    {isViewMode ? <span className="font-semibold">{viewVal}</span> :
                        <Select placeholder={`Chọn ${conf.label}`} allowClear>
                            {conf.data.map((d: any) => <Select.Option key={d.id} value={d.id}>{d[conf.labelKey]}</Select.Option>)}
                        </Select>
                    }
                </Form.Item>
            );
        }

        if (key === 'ghiChu') {
            return (
                <Form.Item {...commonProps} name="ghiChu" label="Ghi chú" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                    {isViewMode ? <span>{employee?.ghiChu}</span> : <Input.TextArea rows={2} />}
                </Form.Item>
            );
        }
        return null;
    };

    return (
        <Modal
            title={
                <div className="flex justify-between items-center pr-8">
                    <span>{isViewMode ? "Chi tiết" : (employee ? "Cập nhật" : "Thêm mới")}</span>
                    {isAdmin && !isViewMode && (
                        <div className="flex items-center gap-2">
                            <span>Sắp xếp:</span>
                            <Switch size="small" checked={isEditLayout} onChange={setIsEditLayout} />
                            {isEditLayout && <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSaveLayout}>Lưu</Button>}
                        </div>
                    )}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            onOk={isViewMode ? onClose : handleOk}
            width={1000}
            centered
            okText={isViewMode ? "Đóng" : "Lưu"}
            cancelButtonProps={{ style: { display: isViewMode ? 'none' : 'inline-block' } }}
        >
            <Form form={form} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} className="mt-4" disabled={isViewMode}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fieldOrder} strategy={rectSortingStrategy}>
                        <Row gutter={ROW_GUTTER}>
                            {fieldOrder.map(key => (
                                <SortableItem key={key} id={key} span={key === 'ghiChu' ? 24 : 8} enabled={isEditLayout}>
                                    {renderField(key)}
                                </SortableItem>
                            ))}
                        </Row>
                    </SortableContext>
                </DndContext>

                <div className="mt-6 border-t pt-4">
                    <div className="flex items-center mb-4">
                        <Checkbox
                            checked={hasKiemNhiem}
                            onChange={(e) => setHasKiemNhiem(e.target.checked)}
                            disabled={isViewMode && (!employee?.kiemNhiem || employee.kiemNhiem.length === 0)}
                        >
                            <span className="font-semibold text-gray-700">Công tác kiêm nhiệm</span>
                        </Checkbox>
                    </div>

                    {hasKiemNhiem && (
                        <Form.List name="kiemNhiem">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={12} align="middle" className="mb-2">
                                            <Col span={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'khoaPhongId']}
                                                    rules={[{ required: true, message: 'Chọn Khoa/Phòng' }]}
                                                    className="mb-0"
                                                >
                                                    <Select placeholder="Khoa/Phòng">
                                                        {categories.khoaPhongs?.map((k: any) => (
                                                            <Select.Option key={k.id} value={k.id}>{k.tenKhoaPhong}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'chucVuId']}
                                                    rules={[{ required: true, message: 'Chọn Chức vụ' }]}
                                                    className="mb-0"
                                                >
                                                    <Select placeholder="Chức vụ">
                                                        {categories.chucVus?.map((c: any) => (
                                                            <Select.Option key={c.id} value={c.id}>{c.tenChucVu}</Select.Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                {!isViewMode && <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer text-lg" />}
                                            </Col>
                                        </Row>
                                    ))}
                                    {!isViewMode && (
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm kiêm nhiệm
                                            </Button>
                                        </Form.Item>
                                    )}
                                </>
                            )}
                        </Form.List>
                    )}
                </div>
            </Form>
        </Modal>
    );
}
