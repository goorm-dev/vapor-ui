const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');

const { GDS_BUCKET_REGION, GDS_BUCKET_NAME } = require('../constants/aws');

/** AWS S3 구성 */
const s3 = new S3Client({
    region: GDS_BUCKET_REGION,

    /**
     * NOTE: 로컬에서 작업시, weep 설정 완료 후, 아래 주석 제거
     * @link https://www.notion.so/goorm/SSM-99d8c1cb5d904995ad7131694c4fdab6#d62eda427216431399b185f8dbc52d53
     */
    // credentials: fromIni(),
});

/**
 * AWS S3에 파일을 업로드한다.
 *
 * @description
 * - svg 파일을 default contentType으로 한다.
 * - 저장 위치는 'gds.goorm.io' 를 default로 한다.
 */
const uploadFileToS3 = ({
    fileKey,
    fileStream,
    awsBucket = GDS_BUCKET_NAME,
    fileType = 'image/svg+xml',
}) => {
    const uploadParams = {
        Bucket: awsBucket,
        Key: fileKey,
        Body: fileStream,
        ContentType: fileType,
    };

    return s3.send(new PutObjectCommand(uploadParams));
};

module.exports = {
    uploadFileToS3,
};
