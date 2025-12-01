import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";

interface Anexo {
  id: string;
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes: number;
  tipo_mime: string | null;
  created_at: string;
}

interface AnexosDFDProps {
  dfdId: string | null;
}

export function AnexosDFD({ dfdId }: AnexosDFDProps) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dfdId) {
      toast({
        title: "Erro",
        description: "É necessário salvar o DFD antes de adicionar anexos",
        variant: "destructive",
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      for (const file of Array.from(files)) {
        const fileName = `${user.id}/${dfdId}/${Date.now()}-${file.name}`;
        
        // Upload do arquivo
        const { error: uploadError } = await supabase.storage
          .from("dfd-anexos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Registrar o anexo no banco de dados
        const { error: dbError } = await supabase
          .from("anexos_dfd")
          .insert({
            dfd_id: dfdId,
            nome_arquivo: file.name,
            caminho_storage: fileName,
            tamanho_bytes: file.size,
            tipo_mime: file.type,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });

      // Recarregar lista de anexos
      loadAnexos();
      
      // Limpar input
      event.target.value = "";
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const loadAnexos = useCallback(async () => {
    if (!dfdId) return;

    const { data, error } = await supabase
      .from("anexos_dfd")
      .select("*")
      .eq("dfd_id", dfdId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar anexos:", error);
      return;
    }

    setAnexos(data || []);
  }, [dfdId]);

  const handleDownload = async (anexo: Anexo) => {
    try {
      const { data, error } = await supabase.storage
        .from("dfd-anexos")
        .download(anexo.caminho_storage);

      if (error) throw error;

      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = anexo.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro",
        description: "Falha ao baixar arquivo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (anexo: Anexo) => {
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from("dfd-anexos")
        .remove([anexo.caminho_storage]);

      if (storageError) throw storageError;

      // Deletar do banco de dados
      const { error: dbError } = await supabase
        .from("anexos_dfd")
        .delete()
        .eq("id", anexo.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso",
      });

      loadAnexos();
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover arquivo",
        variant: "destructive",
      });
    }
  };

  // Carregar anexos quando o componente montar ou dfdId mudar
  useEffect(() => {
    loadAnexos();
  }, [loadAnexos]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Anexos</h3>
        <div className="relative">
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={!dfdId || uploading}
            className="hidden"
            id="file-upload"
          />
          <Button
            asChild
            disabled={!dfdId || uploading}
            size="sm"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Arquivo
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      {!dfdId && (
        <p className="text-sm text-muted-foreground">
          Salve o DFD antes de adicionar anexos
        </p>
      )}

      {anexos.length === 0 && dfdId && (
        <p className="text-sm text-muted-foreground">
          Nenhum arquivo anexado
        </p>
      )}

      {anexos.length > 0 && (
        <div className="space-y-2">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {anexo.nome_arquivo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(anexo.tamanho_bytes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(anexo)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(anexo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}