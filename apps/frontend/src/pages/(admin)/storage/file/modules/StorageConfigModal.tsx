import { Banner, Button, Input, Modal, Radio, RadioGroup, Toast } from "@douyinfe/semi-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { storageApi, storageKeys, useStorageConfigQuery } from "@/service/api/storage";
import type { StorageConfigPayload } from "@/service/api/storage";

interface StorageConfigModalProps {
  onClose: () => void;
  visible: boolean;
}

const StorageConfigModal = ({ onClose, visible }: StorageConfigModalProps) => {
  const queryClient = useQueryClient();
  const { data: configData } = useStorageConfigQuery();

  const [provider, setProvider] = useState<"local" | "alioss" | "cos">("local");
  const [formValues, setFormValues] = useState<Partial<StorageConfigPayload>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (configData) {
      setProvider((configData.provider as any) || "local");
      setFormValues(configData);
    }
  }, [configData]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: StorageConfigPayload = {
        ...formValues,
        provider,
      };
      const res = await storageApi.saveConfig(payload);
      Toast.success(res.message || "存储引擎配置保存成功！");
      await queryClient.invalidateQueries({ queryKey: storageKeys.all });
      onClose();
    } catch (err: any) {
      Toast.error(err.message || "配置保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      footer={
        <div className="flex items-center justify-end gap-12px">
          <Button type="secondary" onClick={onClose}>
            取消
          </Button>
          <Button loading={saving} type="primary" onClick={handleSave}>
            保存配置
          </Button>
        </div>
      }
      title="⚙️ 存储引擎动态配置"
      visible={visible}
      width={640}
      onCancel={onClose}
    >
      <div className="flex flex-col gap-16px my-8px">
        <div>
          <div className="text-13px font-medium mb-8px text-gray-700">
            选择当前生效的存储介质驱动：
          </div>
          <RadioGroup
            direction="horizontal"
            type="button"
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
          >
            <Radio value="local">📁 本地磁盘存储 (Local)</Radio>
            <Radio value="alioss">☁️ 阿里云 OSS</Radio>
            <Radio value="cos">🌩️ 腾讯云 COS</Radio>
          </RadioGroup>
        </div>

        {provider === "local" && (
          <Banner
            description="文件将保存在后端服务器的 public/uploads 目录中，支持完整的分片上传、秒传与断点续传。"
            type="info"
          />
        )}

        {provider === "alioss" && (
          <div className="flex flex-col gap-12px bg-gray-50/50 p-16px rounded-8px border border-gray-100">
            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">AccessKey ID</div>
              <Input
                placeholder="如 LTAI5txxxxxxxxxxxxxx"
                value={formValues.aliossAccessKeyId || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, aliossAccessKeyId: val }))}
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">AccessKey Secret</div>
              <Input
                mode="password"
                placeholder="请输入 阿里云密钥 Secret"
                value={formValues.aliossAccessKeySecret || ""}
                onChange={(val) =>
                  setFormValues((prev) => ({ ...prev, aliossAccessKeySecret: val }))
                }
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Bucket 名称</div>
              <Input
                placeholder="如 forge-storage-bucket"
                value={formValues.aliossBucket || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, aliossBucket: val }))}
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Region 区域</div>
              <Input
                placeholder="如 oss-cn-hangzhou"
                value={formValues.aliossRegion || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, aliossRegion: val }))}
              />
            </div>
          </div>
        )}

        {provider === "cos" && (
          <div className="flex flex-col gap-12px bg-gray-50/50 p-16px rounded-8px border border-gray-100">
            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Secret ID</div>
              <Input
                placeholder="如 AKIDxxxxxxxxxxxxxxxx"
                value={formValues.cosSecretId || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, cosSecretId: val }))}
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Secret Key</div>
              <Input
                mode="password"
                placeholder="请输入 腾讯云 SecretKey"
                value={formValues.cosSecretKey || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, cosSecretKey: val }))}
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Bucket 名称</div>
              <Input
                placeholder="如 forge-bucket-1250000000"
                value={formValues.cosBucket || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, cosBucket: val }))}
              />
            </div>

            <div>
              <div className="text-12px text-gray-600 mb-4px font-medium">Region 区域</div>
              <Input
                placeholder="如 ap-guangzhou"
                value={formValues.cosRegion || ""}
                onChange={(val) => setFormValues((prev) => ({ ...prev, cosRegion: val }))}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StorageConfigModal;
